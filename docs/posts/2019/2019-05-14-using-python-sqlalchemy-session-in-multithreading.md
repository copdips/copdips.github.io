---
authors:
- copdips
categories:
- python
- multithreading
- async
- sqlalchemy
comments: true
date:
  created: 2019-05-14
  updated: 2025-05-14
description: Using Python SQLAlchemy session in multithreading and asyncio by using context manager
  or scoped_session.
---

# Using Python SQLAlchemy session in concurrent threads or tasks

SQLAlchemy DB session is [not thread safe](https://docs.sqlalchemy.org/en/20/orm/session_basics.html#is-the-session-thread-safe-is-asyncsession-safe-to-share-in-concurrent-tasks) for both sync and async session. [AsyncSession](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.AsyncSession) is only a thin proxy on top of a [Session](https://docs.sqlalchemy.org/en/20/orm/session_api.html#sqlalchemy.orm.Session)

> The concurrency model for SQLAlchemy's `Session` and `AsyncSession` is therefore Session per thread, AsyncSession per task.
>
> The best way to ensure this use is by using the [standard context manager pattern](https://docs.sqlalchemy.org/en/20/orm/session_basics.html#session-getting) locally within the top level Python function that is inside the thread or task, which will ensure the lifespan of the `Session` or `AsyncSession` is maintained within a local scope.
>
> For applications that benefit from having a "global" `Session` where it's not an option to pass the [Session](https://docs.sqlalchemy.org/en/20/orm/session_api.html#sqlalchemy.orm.Session) object to specific functions and methods which require it, the [scoped_session](https://docs.sqlalchemy.org/en/20/orm/contextual.html#sqlalchemy.orm.scoped_session) approach can provide for a "thread local" Session object; see the section [Contextual/Thread-local Sessions](https://docs.sqlalchemy.org/en/20/orm/contextual.html#unitofwork-contextual) for background. Within the asyncio context, the [async_scoped_session](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.async_scoped_session) object is the asyncio analogue for [scoped_session](https://docs.sqlalchemy.org/en/20/orm/contextual.html#sqlalchemy.orm.scoped_session), however is more challenging to configure as it requires a custom "context" function.

<!-- more -->

## Way 1 - Using context manager to create a session per thread or task

```python
from multiprocessing.dummy import Pool as ThreadPool

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql+psycopg2://scott:tiger@localhost/")
SessionFactory = sessionmaker(engine)


def thread_worker(session_factory, number):
    with session_factory() as session:
        # do something around the session and the number...
        session.commit()


def work_parallel(engine, numbers, thread_number=4):
    pool = ThreadPool(thread_number)
    results = pool.map(thread_worker, SessionFactory, numbers)
    # If you don't care about the results, just comment the following 3 lines.
    # pool.close()
    # pool.join()
    # return results


if __name__ == "__main__":
    numbers = [1, 2, 3]
    work_parallel(numbers, 8)
```

## Way 2 - Using scoped_session to create a thread-local variable

[https://docs.sqlalchemy.org/en/13/orm/contextual.html#contextual-thread-local-sessions](https://docs.sqlalchemy.org/en/13/orm/contextual.html#contextual-thread-local-sessions)

> The scoped_session object is a very popular and useful object used by many SQLAlchemy applications. However, it is important to note that it presents only one approach to the issue of Session management. If you're new to SQLAlchemy, and especially if the term "thread-local variable" seems strange to you, we recommend that if possible you familiarize first with an off-the-shelf integration system such as Flask-SQLAlchemy or zope.sqlalchemy.

```python
from multiprocessing.dummy import Pool as ThreadPool

from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker


def f1(number):
    # now all calls to Session() will create a thread-local session.
    # If we call upon the Session registry a second time, we get back the same Session.
    session = Session()
    # do something around the session and the number...

    # You can even directly use Session to perform DB actions.
    # See: https://docs.sqlalchemy.org/en/13/orm/contextual.html#implicit-method-access
    # when methods are called on the Session object, they are proxied to the underlying Session being maintained by the registry.


def thread_worker(number):
    f1(number)


def work_parallel(numbers, thread_number=4):
    pool = ThreadPool(thread_number)
    results = pool.map(thread_worker, numbers)
    # If you don't care about the results, just comment the following 3 lines.
    # pool.close()
    # pool.join()
    # return results


if __name__ == "__main__":
    engine = create_engine("postgresql://scott:tiger@localhost/mydatabase")
    session_factory = sessionmaker(bind=engine)

    # The Session object created here will be used by the function f1 directly.
    Session = scoped_session(session_factory)

    numbers = [1, 2, 3]
    work_parallel(numbers, 8)

    Session.remove()
```

## Bonus - How the Python web frameworks work with SQLAlchemy thread local scope

https://docs.sqlalchemy.org/en/20/orm/contextual.html#using-thread-local-scope-with-web-applications
