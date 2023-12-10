---
authors:
- copdips
categories:
- python
- linux
- azure
comments: true
date:
  created: 2023-05-26
description: ''
draft: true
---

# Searching azcli packages installation path

Need to debug some Azure CLI code by add some pdb breakpoints, but don't know where the code is installed ? Here is how to find it.

```bash
$ find / -type d \( -name '*venv' -o -name '*git' \) -prune -o -type d -name 'apimanagement' -pri
nt 2>/dev/null
/opt/az/lib/python3.10/site-packages/azure/mgmt/apimanagement
```
