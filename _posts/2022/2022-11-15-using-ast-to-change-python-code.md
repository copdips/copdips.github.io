---
last_modified_at:
title: "Using ast to change Python code"
excerpt: ""
tags:
  - python
  - ast
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

Since **Python 3.9**, the helper [ast.unparse](https://docs.python.org/3.9/library/ast.html#ast.unparse) has been introduced, so we have both `ast.parse` and `ast.unparse` in our hands, everything is ready, finally we have an official way to change Python code.

For example, I have a the file `setup.py` as belows:

```py
"""setup.py file
"""
from pkg_resources import parse_requirements
from setuptools import setup

with open("requirements.txt", encoding="utf-8") as f:
    install_requires = [str(req) for req in parse_requirements(f)]

setup(
    name="foo",
    install_requires=install_requires,
)
```

I want to change the line `install_requires=install_requires,` by `install_requires=["a==1", "b==2"],`.

Since Python3.9, I can achieve it like this:

```python
import ast
import json

new_install_requires = ["a==1", "b==2"]

setup_file = open("setup.py").read()
setup = ast.parse(setup_file)

print("\n***Before change\n")
print(ast.unparse(setup))

for body in setup.body:
    try:
        if hasattr(body, "value") and hasattr(body.value, "keywords"):
            for kw in body.value.keywords:
                if kw.arg == "install_requires":
                    kw.value = ast.parse(json.dumps(new_install_requires)).body[0]
    except Exception as err:
        print(err)

print("\n***After change\n")
print(ast.unparse(setup))
```

Result from the console:

```bash
$ python3.9 change_setup.py

***Before change

"""setup.py file
"""
from pkg_resources import parse_requirements
from setuptools import setup
with open('requirements.txt', encoding='utf-8') as f:
    install_requires = [str(req) for req in parse_requirements(f)]
setup(name='foo', install_requires=install_requires)

***After change

"""setup.py file
"""
from pkg_resources import parse_requirements
from setuptools import setup
with open('requirements.txt', encoding='utf-8') as f:
    install_requires = [str(req) for req in parse_requirements(f)]
setup(name='foo', install_requires=
['a==1', 'b==2'])
```

You will notice that, the `ast.parse` discards all the comments. And if need to format the code, black could be a good choice.
{: .notice--info}
