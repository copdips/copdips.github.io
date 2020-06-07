---
last_modified_at:
title: "Compiling SQLAlchemy query to nearly real raw sql query"
excerpt: "Compiling SQLAlchemy query to nearly real raw sql query"
tags:
  - python
  - sqlalchemy
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

{% include toc title="Table of content" %}

## Some useful links

1. [https://stackoverflow.com/questions/5631078/sqlalchemy-print-the-actual-query](https://stackoverflow.com/questions/5631078/sqlalchemy-print-the-actual-query)
1. [https://docs.sqlalchemy.org/en/13/faq/sqlexpressions.html?highlight=literal_bind#rendering-bound-parameters-inline](https://docs.sqlalchemy.org/en/13/faq/sqlexpressions.html?highlight=literal_bind#rendering-bound-parameters-inline)
1. [https://docs.sqlalchemy.org/en/13/core/engines.html#configuring-logging](https://docs.sqlalchemy.org/en/13/core/engines.html#configuring-logging)

## Query to compile

Suppose we have a table called Movie, and a column release_date in the table Movie.

```python
> from datetime import date

> from sqlalchemy import create_engine, sessionmaker

> engine = create_engine('sqlite:///moive_example.db')
> Session = sessionmaker(bind=engine)
> session = Session()

> filter1 = Movie.release_date > date(2015, 1, 1)

> filter1
<sqlalchemy.sql.elements.BinaryExpression object at 0x000001FFA56E6BE0>

> str(filter1)
'movies.release_date > :release_date_1'

> query1 = session.query(Movie).filter(Movie.release_date > date(2015, 1, 1)).limit(2)

> query1
<sqlalchemy.orm.query.Query object at 0x0000015A4700A2E0>>

> str(query1)
'SELECT movies.id AS movies_id, movies.title AS movies_title, movies.release_date AS movies_release_date \nFROM movies \nWHERE movies.release_date > ?\n LIMIT ? OFFSET ?'
```

## Compiling to ORM sql query

As per the method given by [Rendering Bound Parameters Inline](https://docs.sqlalchemy.org/en/13/faq/sqlexpressions.html?highlight=literal_bind#rendering-bound-parameters-inline):

### Compiling filter1 to ORM sql query

```python
> filter1.compile()
<sqlalchemy.sql.compiler.StrSQLCompiler object at 0x000001FFA5706AC0>

> str(filter1.compile())
'movies.release_date > :release_date_1'

> str(filter1.compile().params)
"{'release_date_1': datetime.date(2015, 1, 1)}"

> filter1.compile(compile_kwargs={"literal_binds": True})
<sqlalchemy.sql.compiler.StrSQLCompiler object at 0x000001FFA572EEE0>

> str(filter1.compile(compile_kwargs={"literal_binds": True}))
"movies.release_date > '2015-01-01'"
```

### Compiling query1 to ORM sql query

```python
> str(query1.statement.compile())
'SELECT movies.id, movies.title, movies.release_date \nFROM movies \nWHERE movies.release_date > :release_date_1\n LIMIT :param_1'

> str(query1.statement.compile().params)
"{'release_date_1': datetime.date(2015, 1, 1), 'param_1': 2}"

> str(query1.statement.compile(compile_kwargs={"literal_binds": True}))
"SELECT movies.id, movies.title, movies.release_date \nFROM movies \nWHERE movies.release_date > '2015-01-01'\n LIMIT 2"
```

As given by the paragraph name, the above compiled query is not the real raw sql query sent to the database, it's an ORM one. But it's more or less enough for debugging or logging purpose. See below paragraph to get how to compile to real raw sql query.
{: .notice--warning}

## Compiling to nearly real raw sql query

SQLAlchemy doesn't provide an out of the box function to compile a statement to the real raw sql query, and as per some issues' comments, it seems that the authors wouldn't like to implement it. There's no official way, this part is based on some solutions provided by the community.
{: .notice--warning}

If you want to compile to real raw sql query, we should add the corresponding dialect, but be aware that it compiles only some simple types like `Integer`, `String`, etc. For complex types like `Date`, we need to [use `TypeDecorator` to tell SQLAlchemy how to literal render these complex types](https://stackoverflow.com/a/23835766/5095636). Using `TypeDecorator` means to modify your DB models, which is sometimes not a comfortable way.

Below 2 examples (by [using engine or using dialect](https://docs.sqlalchemy.org/en/13/faq/sqlexpressions.html#stringifying-for-specific-databases) show the error message on Date type:

```python
# using engine
> str(filter1.compile(
    engine,
    compile_kwargs={"literal_binds": True},
  ))
NotImplementedError: Don't know how to literal-quote value datetime.date(2015, 1, 1)
```

```python
# using dialect
> from sqlalchemy.dialects import postgresql
> str(query1.statement.compile(
    compile_kwargs={"literal_binds": True},
    dialect=postgresql.dialect(),
  ))
NotImplementedError: Don't know how to literal-quote value datetime.date(2015, 1, 1)
```

### render_query()

Base on this [stackoverflow example](https://stackoverflow.com/a/32772915/5095636), I changed the param dialect to session, and removed the python2 part, hereunder the modified one:

<!-- {% raw %} -->
```python
from sqlalchemy.orm import Query

def render_query(statement, db_session):
    """
    Generate an SQL expression string with bound parameters rendered inline
    for the given SQLAlchemy statement.
    WARNING: This method of escaping is insecure, incomplete, and for debugging
    purposes only. Executing SQL statements with inline-rendered user values is
    extremely insecure.
    Based on http://stackoverflow.com/questions/5631078/sqlalchemy-print-the-actual-query
    """
    if isinstance(statement, Query):
        statement = statement.statement
    dialect = db_session.bind.dialect

    class LiteralCompiler(dialect.statement_compiler):
        def visit_bindparam(
            self, bindparam, within_columns_clause=False, literal_binds=False, **kwargs
        ):
            return self.render_literal_value(bindparam.value, bindparam.type)

        def render_array_value(self, val, item_type):
            if isinstance(val, list):
                return "{}".format(
                    ",".join([self.render_array_value(x, item_type) for x in val])
                )
            return self.render_literal_value(val, item_type)

        def render_literal_value(self, value, type_):
            if isinstance(value, int):
                return str(value)
            elif isinstance(value, (str, date, datetime, timedelta)):
                return "'{}'".format(str(value).replace("'", "''"))
            elif isinstance(value, list):
                return "'{{{}}}'".format(
                    ",".join(
                        [self.render_array_value(x, type_.item_type) for x in value]
                    )
                )
            return super(LiteralCompiler, self).render_literal_value(value, type_)

    return LiteralCompiler(dialect, statement).process(statement)
```
<!-- {% endraw %} -->

### Using the render_query()

The results in sqlite dialect:

```python
> render_query(filter1, session)
"movies.release_date > '2015-01-01'"

> render_query(query1, session)
"SELECT movies.id, movies.title, movies.release_date \nFROM movies \nWHERE movies.release_date > '2015-01-01'\n LIMIT 2 OFFSET 0"
```

With `render_query()`, it renders the query with dialect syntax, but please be aware that the values rendered are the ones translated by `render_literal_value()`, which might not be the ones really passed to SQL database. That's also why I named this post as **nearly real raw sql query**.
{: .notice--warning}
