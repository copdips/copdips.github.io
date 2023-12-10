---
last_modified_at: 2021-03-21 22:28:44
title: "Using Python SQLAlchemy session in multithreading"
excerpt: "Using Python SQLAlchemy session in multithreading by using contextmanager or scope_session."
tags:
  - python
  - sqlalchemy
  - multithreading
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

> SQLAlchemy DB session is [not thread safe](https://docs.sqlalchemy.org/en/13/orm/session_basics.html#is-the-session-thread-safe). In this post, I will show you 2 ways to use it in a multithreading context.


# Way 1 - Using contextmanager to create a session per thread

Below is an example given by the official doc to show how to use the [contextmanager](https://docs.sqlalchemy.org/en/13/orm/session_basics.html#when-do-i-construct-a-session-when-do-i-commit-it-and-when-do-i-close-it) to construct, commit and close a SQLAlchemy session.

```python
### another way (but again *not the only way*) to do it ###

from contextlib import contextmanager


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def run_my_program():
    with session_scope() as session:
        ThingOne().go(session)
        ThingTwo().go(session)
```

Suppose we have a function called `f1` which does something with the session. And we need to call `f1` in a multithreading context.
All we need to do is to add the `session_scope()` around the `f1`:

```python
from contextlib import contextmanager
from multiprocessing.dummy import Pool as ThreadPool

# db_utils is a python file that creats the Session by using the factory sessionmaker(),
# not shown here.
from db_utils import Session


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def f1(session, number):
    # do something around the session and the number...


def thread_worker(number):
    # We're using the session context here.
    with session_scope() as session:
        f1(session, number)


def work_parallel(numbers, thread_number=4):
    pool = ThreadPool(thread_number)
    results = pool.map(thread_worker, numbers)
    # If you don't care about the results, just comment the following 3 lines.
    # pool.close()
    # pool.join()
    # return results


if __name__ == "__main__":
    numbers = [1, 2, 3]
    work_parallel(numbers, 8)
```


# Way 2 - Using scoped_session to create a thread-local variable

[https://docs.sqlalchemy.org/en/13/orm/contextual.html#contextual-thread-local-sessions](https://docs.sqlalchemy.org/en/13/orm/contextual.html#contextual-thread-local-sessions)

> The scoped_session object is a very popular and useful object used by many SQLAlchemy applications. However, it is important to note that it presents only one approach to the issue of Session management. If you’re new to SQLAlchemy, and especially if the term “thread-local variable” seems strange to you, we recommend that if possible you familiarize first with an off-the-shelf integration system such as Flask-SQLAlchemy or zope.sqlalchemy.

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


# Bonus - How the Python web frameworks work with SQLAlchemy thread local scope

[https://docs.sqlalchemy.org/en/13/orm/contextual.html#using-thread-local-scope-with-web-applications](https://docs.sqlalchemy.org/en/13/orm/contextual.html#using-thread-local-scope-with-web-applications)
