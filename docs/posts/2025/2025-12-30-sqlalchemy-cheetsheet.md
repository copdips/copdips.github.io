---
authors:
- copdips
categories:
- python
- sqlalchemy
comments: true
date:
  created: 2025-12-30
published: false
---

# SQLAlchemy cheatsheet

## Architecture

https://aosabook.org/en/v2/sqlalchemy.html

## Engine, Connection, and Session

https://stackoverflow.com/questions/34322471/sqlalchemy-engine-connection-and-session-difference

## Renew connection/session credentials

- https://github.com/sqlalchemy/sqlalchemy/discussions/7148
- https://github.com/sqlalchemy/sqlalchemy/discussions/12133
- https://github.com/sqlalchemy/sqlalchemy/discussions/8349
- https://github.com/sqlalchemy/sqlalchemy/discussions/11806
- https://docs.sqlalchemy.org/en/20/dialects/mssql.html#mssql-pyodbc-access-tokens
- https://community.snowflake.com/s/article/Snowflake-OAuth-Support-Guide
- https://community.snowflake.com/s/article/Create-External-OAuth-Token-Using-Azure-AD-For-The-OAuth-Client-Itself

## Refreshing volatile authentication tokens

Use the [event lister to refresh volatile authentication credentials](https://docs.sqlalchemy.org/en/14/core/engines.html#generating-dynamic-authentication-tokens).

Event Hooks:

- `checkout` Event: Triggered when a connection is checked out from the pool. Useful for tasks like setting session-level parameters. each `engine.connect()` will trigger this event.
- `checkin` Event: Triggered when a connection is returned to the pool (reverse operation of `checkout`). Can be used for cleanup tasks.
- `connect` Event:
    Type: Notification Event
    Purpose: Triggered after a new DBAPI connection has been established.
    Usage: Primarily used for performing actions post-connection, such as setting session-level parameters, initializing database schemas, or logging connection details. First `engine.connect()` (not the subsequent) will trigger this event.
- `do_connect` Event:
    Type: Customization Hook
    Purpose: Allows developers to override or customize the actual process of establishing a new DBAPI connection.
    Usage: Useful when you need to implement custom connection logic, integrate with non-standard DBAPI drivers, or modify connection parameters dynamically. First `engine.connect()` (not the subsequent) will trigger this event.
    `do_connect` event is triggered before the `connect` event.

```python
from sqlalchemy import event

engine = create_engine("postgresql://user@hostname/dbname")


@event.listens_for(engine, "do_connect")
def provide_token(dialect, conn_rec, cargs, cparams):
    cparams["token"] = get_authentication_token()
```

Some vendor specific SQL servers ([Snowflake for .e.g](https://github.com/snowflakedb/snowflake-sqlalchemy/issues/550)) implementations some kind of keep-live heartbeat mechanism to keep the connection alive. Which means once the user is logged in, the connection (user session) will be kept alive until the user logs out even the token is expired. User don't need to send small query to keep alive, as the keep-alive signals are sent in background by the vendor specific module implicitly. This is useful for long running applications.
