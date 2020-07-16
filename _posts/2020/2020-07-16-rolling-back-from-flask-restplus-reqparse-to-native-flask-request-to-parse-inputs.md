---
last_modified_at:
title: "Rolling back from flask-restplus reqparse to native flask request to parse inputs"
excerpt: "flask-restplus (flask-restx) reqparse is deprecated, migration to native flask request has some points to take care of"
tags:
  - python
  - flask
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

flask-restplus' (or flask-restx) [reqparse module is deprecated](https://flask-restx.readthedocs.io/en/latest/parsing.html), so I decided to use the native flask request object to parse the incoming inputs.

After the try, I noticed some points to take care of. Before listing these points, I will show you how to use native flask request to parse the inputs.

The flask-restplus official doc [suggests](https://flask-restx.readthedocs.io/en/latest/parsing.html) to use [marshmallow](https://marshmallow.readthedocs.io/en/stable/) to replace reqparse.
{: .notice--info}

## Parsing inputs with the native flask request

The native [Flask Request](https://flask.palletsprojects.com/en/master/api/#flask.Request) object has many attributes. To parse the incoming inputs, we can mainly use:

```python
from flask import request
request.args
request.json
request.data
request.form
request.headers
request.authorization
```

`request` is a [global object](https://flask.palletsprojects.com/en/master/api/#flask.request) always available in any active request contexts.

## Point 1. Smart boolean type

flask-restplus's boolean type is actually a [smart boolean type](https://github.com/python-restx/flask-restx/blob/a28f9c11566adbfe307cf6784905469e5cdaf543/flask_restx/inputs.py#L507), which can convert bool True, or string "True", "tRue", "1" etc., or int 1 to True, so as to False. This is very smart.

```python
parser.add_argument('flag', type=inputs.boolean)
```

When I rolled back to using the flask.request, there's no such smartness, so be careful how the API parsed the inputs with flask-restplus previously. If it accepted for example the string 'false' as smart boolean, which will be converted to boolean `False` with flask-restplus, once migrated to the native flask.request.json, the string 'false' is considered as a boolean `True`.

```python
>>> bool("false")
True
```

So maybe as a quick backward compatible workaround, we can reuse the smart boolean source code.

## Point 2. Optional inputs

flask-restplus can define an optional input like this:

```python
parser.add_argument('name', required=False, help="Name cannot blank!")
```

If user doesn't provide `name` in the inputs, the reqparse will render it as `{"name": None}`, which means the optional input has `None` as its default value.

But in the native flask.request.json, we won't see this input at all if it was not provided. So if the API backend must need the input `name`, we must add some protection.

## Tests

In the end, I would just like to suggest everyone to write as many tests as we can to cover all the use cases.
