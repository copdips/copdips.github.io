---
title: "SQLAlchemy mixin in method"
last_modified_at:
excerpt: "Share common methods across SQLAlchemy db model classes by using mixin."
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


Sorry, wrong code given, I should remove it.

<s>
{% include toc title="Table of content" %}
If I'm not wrong, the [SQLAlchemy official doc](https://docs.sqlalchemy.org/en/latest/orm/extensions/declarative/mixins.html) provides some examples to explain how to share a set of common columns, some common table options, or other mapped properties, across many classes. But I cannot find how to share common methods (e.g. your customized to_dict() method). This post will just show you a POC to achieve that.

## Share the common method to_dict() across two SQLAlchemy models

The code below is not prod ready, **it has still many drawbacks**.
For example, the rows returned by the query can use the `to_dict()` method but a new object created from the model cannot use the `to_dict()`. It will throw an error saying that the mocked object is not iterable. I think I should take a look at how does the [sqlalchemy-mixin](https://github.com/absent1706/sqlalchemy-mixins) module work.
{: .notice--warning}


```python
from unittest.mock import Mock

from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CommonMethodsMixin(object):
    def __init__(cls, **kwargs):
        cls.__table__ = Mock("mocked_table")
        super(CommonMethodsMixin, cls).__init__(**kwargs)

    def to_dict(cls):
        return {c.name: str(getattr(cls, c.name)) for c in cls.__table__.columns}


class ModelA(CommonMethodsMixin, Base):
    __tablename__ = "model_a"

    mdoela_id = Column(Integer, primary_key=True)
    name = Column(String)


class ModelB(CommonMethodsMixin, Base):
    __tablename__ = "model_b"

    modelb_id = Column(Integer, primary_key=True)
    name = Column(String)
```
</s>
