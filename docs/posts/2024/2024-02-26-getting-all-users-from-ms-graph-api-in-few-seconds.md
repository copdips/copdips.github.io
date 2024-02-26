---
authors:
- copdips
categories:
- api
- python
- async
- azure
- pandas
comments: true
date:
  created: 2024-02-26
---

# Getting all users from MS Graph API in few seconds

MS Graph API's endpoint for retrieving users, [GET /users](https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http) can return all users of the tenant. The default limit is 100 users per page, and the maximum limit is 999 users per page. If there are more than 999 users, the response will contain a `@odata.nextLink` field, which is a URL to the next page of users. For a big company having a large number of users (50,000, 100,000, or even more), and it can be time-consuming to retrieve all users.

While MS Graph API boasts generous [throttling limits](https://learn.microsoft.com/en-us/graph/throttling-limits), we should find a way to parallelize the queries. This post explores sharding as a strategy to retrieve all users in a matter of seconds. The idea is to get all users by dividing users based on the first character of the `userPrincipalName` field.For instance, shard 1 would encompass users whose `userPrincipalName` starts with `a`, shard 2 would handle users starting with `b`, and so forth.

## How to find the sharding field

The user object in MS Graph API has many fields, including `userPrincipalName`. But how I found the `userPrincipalName` is the sharding field?

1. Get a single user object, analyze all the available fields. By default, GET /users only returns few fields, to get all fields.
2. Firstly, I tried to use `id` as the sharding field, I tried use the filter `f"startswith(id,'{shard}')"`, but the MS GRAPH API returned an error: *"The 'id' property can only be used with eq filter"*.
3. By checking other fields, I found `userPrincipalName`, `email`, `displayName`, and `department` etc.
4. I would like to use a field that doesn't has None value and easily split to 20+ shards. For this I got all the users without sharding in advance, and use pandas to check the columns without `None` value. From the below code snippet, I found `id`, `userPrincipalName`, `displayName`, `assignedLicenses` don't have `None` value. `id` can't be used as the as explained previously, `assignedLicenses` contains empty list, it remains `userPrincipalName` and `displayName`. I chose `userPrincipalName` and verified that the first character are `[a-zA-Z0-9-]`.

    ```python title="verify that userPrincipalName doesn't have None value"
    import pandas as pd

    all_users = get_all_users_without_sharding()
    df = pd.DataFrame(all_users)
    has_none_values = df.isna().any()

    print(has_none_values)

    id                             False
    mail                            True
    companyName                     True
    displayName                    False
    onPremisesUserPrincipalName     True
    userPrincipalName              False
    jobTitle                        True
    userType                        True
    department                      True
    assignedLicenses               False
    dtype: bool
    ```

    ```python title="verify that userPrincipalName's first character are [a-zA-Z0-9-]"
    first_chars = {user["userPrincipalName"][0] for user in all_users}

    print(first_chars)
    {'M', 'd', 'W', 'v', 'N', 'R', 'Q', 'T', 'H', '2', 'L', 'Y', 'x', 'k', ...}
    ```

5. Given that `userPrincipalName`'s first characters are in `a-zA-Z0-9-`, and as MS GRAPH API is case insensitive at least for `userPrincipalName` filter, which means we can create 37 shards (26+10+1), which means 37 asyncio concurrent tasks, which also means the total time to get all users is reduced to approximately 1/37 of the original time.
6. Maybe we can find other sharding fields, but the first character of `userPrincipalName` is good enough for me.

## High-level code example

```python
import asyncio
import string


async def get_users_by_shard_upn(shard: str) -> list[dict]:
    url = f"https://graph.microsoft.com/v1.0/users"
    params = {
        "$top": 999,
        "$filter": f"startswith(userPrincipalName,'{shard}')"
    }
    # get users in shard with pagination @odata.nextLink
    ...
    return users_in_shard


async def get_users() -> list[dict]:
    shards = list(string.ascii_lowercase + string.digits + "-")
    tasks = [get_users_by_shard_upn(shard) for shard in shards]
    users = []
    for task in asyncio.as_completed(tasks):
        users.extend(await task)
    return users
```
