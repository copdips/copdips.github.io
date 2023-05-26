---
last_modified_at:
title: "Searching azcli packages installation path"
excerpt: ""
tags:
  - python
  - linux
  - azure
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

Need to debug some Azure CLI code by add some pdb breakpoints, but don't know where the code is installed ? Here is how to find it.

```bash
$ find / -type d \( -name '*venv' -o -name '*git' \) -prune -o -type d -name 'apimanagement' -pri
nt 2>/dev/null
/opt/az/lib/python3.10/site-packages/azure/mgmt/apimanagement
```
