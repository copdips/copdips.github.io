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

# SQLAlchemy cheat-sheet

## Architecture

https://aosabook.org/en/v2/sqlalchemy.html

## Online tutorials

* https://leapcell.medium.com/leapcell-the-next-gen-serverless-platform-for-python-app-hosting-0722d1b32047

<!-- more -->

## Engine, Connection, and Session

https://stackoverflow.com/questions/34322471/sqlalchemy-engine-connection-and-session-difference

### Session-level vs. Engine level transaction control

Just copied from the [official documentation](https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#session-level-vs-engine-level-transaction-control):

| ORM                                        | Core                                       |
| ------------------------------------------ | ------------------------------------------ |
| sessionmaker                               | Engine                                     |
| Session                                    | Connection                                 |
| sessionmaker.begin()                       | Engine.begin()                             |
| some_session.commit()                      | some_connection.commit()                   |
| with some_sessionmaker() as session:       | with some_engine.connect() as conn:        |
| with some_sessionmaker.begin() as session: | with some_engine.begin() as conn:          |
| with some_session.begin_nested() as sp:    | with some_connection.begin_nested() as sp: |

### with Session() as session vs with Session.begin() as session

ref: https://docs.sqlalchemy.org/en/20/orm/session_api.html#session-and-sessionmaker

```python hl_lines="11"
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# an Engine, which the Session will use for connection resources
engine = create_engine("postgresql+psycopg2://scott:tiger@localhost/")

Session = sessionmaker(engine)
with Session() as session:
    session.add(some_object)
    session.add(some_other_object)
    # need manual commit
    session.commit()
```

```python
with Session.begin() as session:
    # auto commits on context exit
    session.add(some_object)
    session.add(some_other_object)
```

| Aspect                        | with Session() as session                | with Session.begin() as session       |
| ----------------------------- | ---------------------------------------- | ------------------------------------- |
| Transaction Start immediately | same                                     | same                                  |
| Session is closed on complete | same                                     | same                                  |
| Rollback on Exception         | same                                     | same                                  |
| (different) Commit Behavior   | Requires explicit commit to save changes | Automatically commits on context exit |

### Using event lister to refresh volatile authentication credentials

* https://github.com/sqlalchemy/sqlalchemy/discussions/7148
* https://github.com/sqlalchemy/sqlalchemy/discussions/12133
* https://github.com/sqlalchemy/sqlalchemy/discussions/8349
* https://github.com/sqlalchemy/sqlalchemy/discussions/11806
* https://docs.sqlalchemy.org/en/20/dialects/mssql.html#mssql-pyodbc-access-tokens
* https://community.snowflake.com/s/article/Snowflake-OAuth-Support-Guide
* https://community.snowflake.com/s/article/Create-External-OAuth-Token-Using-Azure-AD-For-The-OAuth-Client-Itself

Use the [event lister to refresh volatile authentication credentials](https://docs.sqlalchemy.org/en/20/core/engines.html#generating-dynamic-authentication-tokens).

Event Hooks:

* `checkout` Event: Triggered when a connection is checked out from the pool. Useful for tasks like setting session-level parameters. each `engine.connect()` will trigger this event.
* `checkin` Event: Triggered when a connection is returned to the pool (reverse operation of `checkout`). Can be used for cleanup tasks.
* `connect` Event:
    Type: Notification Event
    Purpose: Triggered after a new DBAPI connection has been established.
    Usage: Primarily used for performing actions post-connection, such as setting session-level parameters, initializing database schemas, or logging connection details. First `engine.connect()` (not the subsequent) will trigger this event.
* `do_connect` Event:
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

## mapped_column vs column property

* <https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html#declarative-table-with-mapped-column>
* <https://stackoverflow.com/a/76499049/5095636>

```python title="Column from sqlalchemy directly"
from sqlalchemy import Column
```

```python title="mapped_column, Mapped from sqlalchemy.orm"
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
```

The [mapped_column()](https://docs.sqlalchemy.org/en/20/orm/mapping_api.html#sqlalchemy.orm.mapped_column) can have type annotations within a special SQLAlchemy type called [Mapped](https://docs.sqlalchemy.org/en/20/orm/internals.html#sqlalchemy.orm.Mapped).
For e.g.:

* `fullname: Mapped[str]` is compiled to SQL: `fullname VARCHAR NOT NULL`
* `fullname: Mapped[Optional[str]]` is compiled to SQL: `fullname VARCHAR`

[Default type map](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html#mapped-column-derives-the-datatype-and-nullability-from-the-mapped-annotation) ():

```python
from typing import Any
from typing import Dict
from typing import Type

import datetime
import decimal
import uuid

from sqlalchemy import types

# default type mapping, deriving the type for mapped_column()
# from a Mapped[] annotation
type_map: Dict[Type[Any], TypeEngine[Any]] = {
    bool: types.Boolean(),
    bytes: types.LargeBinary(),
    datetime.date: types.Date(),
    datetime.datetime: types.DateTime(),
    datetime.time: types.Time(),
    datetime.timedelta: types.Interval(),
    decimal.Decimal: types.Numeric(),
    float: types.Float(),
    int: types.Integer(),
    str: types.String(),
    uuid.UUID: types.Uuid(),
}
```
