---
title: "Creating Custom Python Request Auth Class"
excerpt: "Creating custom python request auth class with requests.auth.AuthBase."
tags:
  - python
  - requests
published: true
# header:
#   teaserlogo:
#   teaser: ''
#   image: ''
#   caption:
gallery:
  - image_path: ''
    url: ''
    title: ''
---

> When you need to use a complicated, or a non-standard API authentication method,
> or your dev and prd environments don't use the same API authentication method,
> it might be better to create a Python requests auth method to reduce your work.

# Create the class MyAuth

Suppose you have an API url at: https://httpbin.org/,
its authentication method is by request's headers where `headers["Authorization"] = username_password`.

So the class MyAuth could be as following:

**The most important is the `__call__()` method.**

```python
import requests


def auth_header_value(username, password):
    return "{}_{}".format(username, password)


class MyAuth(requests.auth.AuthBase):
    # http://docs.python-requests.org/en/master/user/authentication/#new-forms-of-authentication
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __call__(self, r: requests.Request):
        # Implement my authentication
        # http://docs.python-requests.org/en/master/_modules/requests/auth/
        r.headers["Authorization"] = auth_header_value(self.username, self.password)
        return r

# unittest
def test_myauth():
    username = "u1"
    password = "p1"
    auth = MyAuth(username, password)
    url = "https://httpbin.org/"
    # http://docs.python-requests.org/en/master/user/advanced/
    prepared_request = requests.Request("GET", url)
    prepared_request_with_auth = auth.__call__(prepared_request)
    assert prepared_request_with_auth.headers["Authorization"] == "{}_{}".format(
        username, password
    )
```

# Use the class MyAuth

## Without the class MyAuth

We should directly provide the headers object in the request:

```python
import requests

username = "u1"
password = "p1"
url = "https://httpbin.org/"
headers = {"Authorization": "{}_{}".format(username, password)}
requests.get(url, headers=headers)
```

## With the class MyAuth

We just need pass it to the param `auth`:

```python
import requests
import MyAuth

username = "u1"
password = "p1"
url = "https://httpbin.org/"
auth = MyAuth(username, password)
requests.get(url, auth=auth)
```

# Conditional MyAuth

You may not find the power of the MyAuth from te above examples. True.
But suppose if your **dev API uses HTTPBasicAuth**,
and your **prd API uses a special key ("token") in the request's headers**.
And suppose you have many APIs to target in this manner.
What would you do without the class MyAuth ? Adding `if..else..` block everywhere ?

With the class MyAuth, we just need to add only once `if..else..` block in the `__call__()` method.

For example:

```python
import requests


def auth_header_value(username, password):
    return "{}_{}".format(username, password)


class MyAuth(requests.auth.AuthBase):
    # http://docs.python-requests.org/en/master/user/authentication/#new-forms-of-authentication
    def __init__(self, username, password, token, env):
        # we must specify all the possible auth credentials here,
        # and the variables (env) which allows to select the credential to use.
        self.username = username
        self.password = password
        self.token = token
        self.env = env

    def __call__(self, r: requests.Request):
        # Implement my authentication
        if env == "dev":
            # http://docs.python-requests.org/en/master/_modules/requests/auth/
            r.headers['Authorization'] = requests.auth._basic_auth_str(
                self.username, self.password
            )
        elif env == "prd":
            r.headers["token"] = self.token
        return r
```
