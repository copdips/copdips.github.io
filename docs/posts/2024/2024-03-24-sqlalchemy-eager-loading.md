---
authors:
- copdips
categories:
- python
- sqlalchemy
comments: true
date:
  created: 2024-03-24
---

# Sqlalchemy eager loading

This posts describes the differences on `selectinload`, `joinedload`, `subqueryload`, these [3 popular eager loading techniques in Sqlalchemy](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html) (so as to [SQLModel](https://sqlmodel.tiangolo.com/))

<!-- more -->

## When to use which eager loading

Directly quoting the official doc: https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#what-kind-of-loading-to-use

| eager loading                                                                                              | pros                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [selectinload](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#select-in-loading)      | good performance for `one-to-one`, `one-to-many`, `many-to-many` relationships.<br>Such as getting team with many users.                                                                                                      |
| [joinedload](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#joined-eager-loading)     | good performace for `many-to-one` relationships.<br>Such as getting users with team..<br>In case using with `one-to-many` or `many-to-many` collections, the `Result.unique()` method must be applied to the returned result. |
| [subqueryload](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#subquery-eager-loading) | legacy, replaced by `selectinload`.<br>But useful when the model is using `composite primary keys` or the SQL servers don't support `tuples with IN` orperator.                                                               |

## SQL queries

The following examples are based on the Hero and Team models example in the [SQLModel relationship tutorial](https://sqlmodel.tiangolo.com/tutorial/fastapi/relationships/).

### selectinload queries

#### selectinload with one team

Two SQL queries are generated for each selectinload query, the first one is to get the parent object, the second one is to get the child objects with tuple IN operator. `SELECT ... FROM ... WHERE ... IN ...`.

```python title="python"
team = await self.session.get(Team, team_id, options=[selectinload(Team.users)])
```

```sql title="sql"
SELECT team.name AS team_name, team.id AS team_id, team.created_at AS team_created_at, team.updated_at AS team_updated_at, team.headquarters AS team_headquarters
FROM team
WHERE team.id = $1::VARCHAR


SELECT "user".team_id AS user_team_id, "user".name AS user_name, "user".first_name AS user_first_name, "user".last_name AS user_last_name, "user".id AS user_id, "user".created_at AS user_created_at, "user".updated_at AS user_updated_at
FROM "user"
WHERE "user".team_id IN ($1::VARCHAR)
('01HSGMMWS7PPXF62NDG64NRZC2',)
```

#### selectinload with many teams

```python title="python"
(await self.session.exec(select(Team).options(selectinload(Team.users)).offset(offset).limit(limit))).all()
```

```sql title="sql"
SELECT team.name, team.id, team.created_at, team.updated_at, team.headquarters
FROM team
LIMIT $1::INTEGER OFFSET $2::INTEGER
(100, 0)


SELECT "user".team_id AS user_team_id, "user".name AS user_name, "user".first_name AS user_first_name, "user".last_name AS user_last_name, "user".id AS user_id, "user".created_at AS user_created_at, "user".updated_at AS user_updated_at
FROM "user"
WHERE "user".team_id IN ($1::VARCHAR, $2::VARCHAR, $3::VARCHAR)
('01HSGMBAAC9FM44CE2AP12JR4K', '01HSGMBAAD0Y1MAB34P1D915WW', '01HSGMBAAD9QHFZ320S1JMD2BF')
```

### joinedload queries

Only one SQL query is generated for each joinedload query. `SELECT ... FROM ... LEFT OUTER JOIN ...` or `SELECT ... FROM ... JOIN ...`.

#### joinedload with one team

```python title="python"
team = await self.session.get(Team, team_id, options=[joinedload(Team.users)])
```

```sql title="sql"
SELECT team.name AS team_name, team.id AS team_id, team.created_at AS team_created_at, team.updated_at AS team_updated_at, team.headquarters AS team_headquarters, user_1.name AS user_1_name, user_1.first_name AS user_1_first_name, user_1.last_name AS user_1_last_name, user_1.id AS user_1_id, user_1.created_at AS user_1_created_at, user_1.updated_at AS user_1_updated_at, user_1.team_id AS user_1_team_id
FROM team LEFT OUTER JOIN "user" AS user_1 ON team.id = user_1.team_id
WHERE team.id = $1::VARCHAR
('01HSGMF5S7ZG0QGTH49XNYBY1F',)
```

#### joinedload with many teams

```python title="python"
(await self.session.exec(select(Team).options(joinedload(Team.users)).offset(offset).limit(limit))).unique().all()
```

!!! warning "must use unique() method"
    The `Result.unique()` method must be applied to the returned result for [one-to-many or many-to-many collections](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#joined-eager-loading), here Team to users is a `one-to-many` collection.

```sql title="sql"
SELECT anon_1.name, anon_1.id, anon_1.created_at, anon_1.updated_at, anon_1.headquarters, user_1.name AS name_1, user_1.first_name, user_1.last_name, user_1.id AS id_1, user_1.created_at AS created_at_1, user_1.updated_at AS updated_at_1, user_1.team_id
FROM (SELECT team.name AS name, team.id AS id, team.created_at AS created_at, team.updated_at AS updated_at, team.headquarters AS headquarters
FROM team
LIMIT $1::INTEGER OFFSET $2::INTEGER) AS anon_1 JOIN "user" AS user_1 ON anon_1.id = user_1.team_id
(100, 0)
```

### subqueryload queries

Two SQL queries are generated for each subqueryload query, the first one is to get the parent object, the second one is to get the child objects with subquery, `SELECT ... FROM (SELECT ...)`.

#### subqueryload with one team

```python title="python"
team = await self.session.get(Team, team_id, options=[subqueryload(Team.users)])
```

```sql title="sql"
SELECT team.name AS team_name, team.id AS team_id, team.created_at AS team_created_at, team.updated_at AS team_updated_at, team.headquarters AS team_headquarters
FROM team
WHERE team.id = $1::VARCHAR
('01HSGM4SR892PFPHEDJRNPYVCH',)

SELECT "user".name AS user_name, "user".first_name AS user_first_name, "user".last_name AS user_last_name, "user".id AS user_id, "user".created_at AS user_created_at, "user".updated_at AS user_updated_at, "user".team_id AS user_team_id, anon_1.team_id AS anon_1_team_id
FROM (SELECT team.id AS team_id
FROM team
WHERE team.id = $1::VARCHAR) AS anon_1 JOIN "user" ON anon_1.team_id = "user".team_id
('01HSGM4SR892PFPHEDJRNPYVCH',)
```

#### subqueryload with many teams

```python title="python"
(await self.session.exec(select(Team).options(subqueryload(Team.users)).offset(offset).limit(limit))).all()
```

```sql title="sql"
SELECT team.name, team.id, team.created_at, team.updated_at, team.headquarters
FROM team
LIMIT $1::INTEGER OFFSET $2::INTEGER
(100, 0)

SELECT "user".name AS user_name, "user".first_name AS user_first_name, "user".last_name AS user_last_name, "user".id AS user_id, "user".created_at AS user_created_at, "user".updated_at AS user_updated_at, "user".team_id AS user_team_id, anon_1.team_id AS anon_1_team_id
FROM (SELECT team.id AS team_id
FROM team
LIMIT $1::INTEGER OFFSET $2::INTEGER) AS anon_1 JOIN "user" ON anon_1.team_id = "user".team_id
(100, 0)
```
