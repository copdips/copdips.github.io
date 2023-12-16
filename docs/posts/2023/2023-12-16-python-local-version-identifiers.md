---
authors:
- copdips
categories:
- python
comments: true
date:
  created: 2023-12-16
description: ''
---

# Python local version identifiers

Python local version identifiers are used to distinguish between different builds of the same version of a package. They are used to indicate that a package has been modified in some way from the original source code, but should still be considered the same version.

<!-- more -->

Check the [PEP 440](https://www.python.org/dev/peps/pep-0440/#local-version-identifiers) for more details.

Local version identifiers MUST comply with the following scheme:

```text
<public version identifier>[+<local version label>]
```

A simple way to compute this version number could be:

```python title="file setup.py"
from datetime import datetime, timezone
...
# suppose the Python module my_package has a __version__ attribute
version=my_package.__version__ + "+" + datetime.now(timezone.utc).strftime("%Y%m%d.%H%M%S")
```

!!! note "`datetime.now(timezone.utc)` is [preferred](https://copdips.com/2021/06/python-datetime-utcnow.html) over `datetime.utcnow()`"
