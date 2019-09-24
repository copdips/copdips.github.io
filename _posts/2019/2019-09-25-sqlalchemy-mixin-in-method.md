---
title: "SQLAlchemy mixin in method"
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

{% include toc title="Table of content" %}

If I'm not wrong, the [SQLAlchemy official doc](https://docs.sqlalchemy.org/en/latest/orm/extensions/declarative/mixins.html) provides some examples to explain how to share a set of common columns, some common table options, or other mapped properties, across many classes. But I cannot find how to share common methods (e.g. your customized to_dict() method). This post will just show you a POC to achieve that.

## Share the common method to_dict() across two SQLAlchemy models

```python
from unittest.mock import Mock

from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CommonMethodsMixin(object):
    def __init__(self):
        self.__table__ = Mock("mocked_table")

    def to_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}


class ModelA(CommonMethodsMixin, Base):
    __tablename__ = "model_a"

    id = Column(Integer, primary_key=True)
    name = Column(String)


class ModelB(CommonMethodsMixin, Base):
    __tablename__ = "model_b"

    id = Column(Integer, primary_key=True)
    name = Column(String)
```