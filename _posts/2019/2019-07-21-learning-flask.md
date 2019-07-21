---
title: "Learning Flask"
excerpt: "Learning Flask."
tags:
  - python
  - flask
  - werkzeug
published: false
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

> Each [official Flask doc](https://flask.palletsprojects.com/en/master/) page worths to read.

## Request variables

### Variable rules

Flask provides by default [some basic converters](https://flask.palletsprojects.com/en/master/quickstart/#variable-rules):

- string (this is the default one and the string will be converted to an unicode string) (regex: '[^/]+')
- int
- float
- path (regex: '[^/].*?')
- uuid
- any (regex: '[^/]+') (same as string)

An example by converting the input string to an uuid:

```python
@app.route('/api/job_id/<uuid:job_id>')
def job(job_id):
    return str(type(job_id))
```

Test with uuid in string as input:

```powershell
6.2.2> curl.exe 127.0.0.1:5000/api/job/$(new-guid)
<class 'uuid.UUID'>
```

Test with int in string as input, this should throw an error as int cannot be converted to an uuid:

```powershell
6.2.2> curl.exe 127.0.0.1:5000/api/job/1
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<title>404 Not Found</title>
<h1>Not Found</h1>
<p>The requested URL was not found on the server. If you entered the URL manually
please check your spelling and try again.</p>
```

We can define some custom converters, but it is not suggested. Keep things explicit and simple.

## Debug

### Auto start Flask in debug mode

Flask can be started in [the debug mode](https://flask.palletsprojects.com/en/master/quickstart/#debug-mode) by setting a env var: `FLASK_DEBUG=1` or `FLASK_ENV=development`

To prevent from setting this var every time, we can use the combination of:

- the **.env** file: put `FLASK_DEBUG=1` or `FLASK_ENV=development` (case sensitive) inside.
- the **python-dotenv** module: `pip install python-dotenv`.

In the end, just from your shell, type `python app.py` to start the Flask in debug mode, or open the `app.py` file in VSCode, then press `F4` to start it.

Don't use this setting in a production environment.
{:notice--warning}

## URL

### Trailing slash

- If the endpoint is to return a list of something, **add** the trailing slash (`/api/jobs/`).
  > calling `/api/jobs` will [be redirected to](https://flask.palletsprojects.com/en/master/quickstart/#unique-urls-redirection-behavior) `/api/jobs/`.
- If the endpoint is to return a single element, **do not add** the trailing slash (`/api/job/<job_id>`).
  > calling `/api/job/<job_id>/` will throw a **404 Not Found** error.

## Response

We can sent the response by `jsonify()` function which creates a Flask Response object.

```python
from flask import jsonify

@app.route('/api/hello/<name>')
def hello(name):
    response = jsonify({'Hello': name})
    return response
```

Otherwise, Flask can try to parse some objects into Response object with following rules:

- `str`: The data gets encoded as UTF-8 and used as the HTTP response body.
- `bytes/bytesarray`: Used as the body.
- `A (response, status, headers) tuple`: Where response can be a Response object or one of the previous types. **status is an integer value** that overwrites the response status, and headers is a mapping that extends the response headers.
- `A (response, status) tuple`: Like the previous one, but without specific headers
- `A (response, headers) tuple`: Like the preceding one, but with just extra headers
