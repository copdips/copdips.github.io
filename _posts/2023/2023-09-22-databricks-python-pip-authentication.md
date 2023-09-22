---
last_modified_at:
title: "Databricks Python pip authentication"
excerpt: ""
tags:
  - databricks
  - python
  - pip
  - auth
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

Before the Databricks Unit Catalog's release, we used init scripts to generate the `pip.conf` file during cluster startup, allowing each cluster its unique auth token. But with init scripts no longer available in the Unit Catalog's **shared mode**, an alternative approach is required.

A workaround involves placing a prepared `pip.conf` in the Databricks workspace and setting the `PIP_CONFIG_FILE` environment variable to point to this file. This method, however, presents security concerns: the `pip.conf` file, containing the auth token, becomes accessible to the entire workspace, potentially exposing it to all users and clusters. See [here](https://github.com/databrickslabs/dbx/issues/739#issuecomment-1730308586) to check this workaround.

In contrast, the Unit Catalog's **single mode** retains init script availability. Here, the pip auth token is stored securely in a vault and accessed via the Databricks secret scope. Upon cluster startup, the init script fetches the token from the vault, generating the `pip.conf` file. This approach is considerably more secure than the shared mode alternative.
