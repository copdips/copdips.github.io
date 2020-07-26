---
title: "SQLAlchemy mixin in method"
last_modified_at: "2020-07-26 13:47:04"
excerpt: "Share common methods across SQLAlchemy db model classes by using mixin."
tags:
  - python
  - sqlalchemy
published: true
# header:
#   teaserlogo:
#   teaser: ''
#   image: ''
#   caption
gallery:
  - image_path: ''
    url: ''
    title: ''
---


{% include toc title="Table of content" %}
If I'm not wrong, the [SQLAlchemy official doc](https://docs.sqlalchemy.org/en/latest/orm/extensions/declarative/mixins.html) provides some examples to explain how to share a set of common columns, some common table options, or other mapped properties, across many classes. But I cannot find how to share common methods (e.g. your customized to_dict() method). This post will just show you a POC to achieve this goal by using [Python Mixin](https://realpython.com/inheritance-composition-python/).

## Share the common method to_dict() across two SQLAlchemy models

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class ModelMixin(object):

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class ModelA(Base, ModelMixin):
    __tablename__ = "model_a"

    model_id = Column(Integer, primary_key=True)
    name = Column(String)


class ModelB(Base, ModelMixin):
    __tablename__ = "model_b"

    model_id = Column(Integer, primary_key=True)
    name = Column(String)
```

Test:

```python
# to_dict() method from ModelMixin is shared between ModelA and ModelB

>>> a = ModelA(model_id=11, name='a1')
>>> a.to_dict()
{'model_id': 11, 'name': 'a1'}

>>> b = ModelB(model_id=22, name='b1')
>>> b.to_dict()
{'model_id': 22, 'name': 'b1'}
```
