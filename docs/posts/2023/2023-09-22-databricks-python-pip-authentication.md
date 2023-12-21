---
authors:
- copdips
categories:
- databricks
- python
- pip
- auth
comments: true
date:
  created: 2023-09-22
  updated: 2023-12-21
description: ''
---

# Databricks Python pip authentication

Before the Databricks Unit Catalog's release, we used [init scripts](https://learn.microsoft.com/en-us/azure/databricks/init-scripts/) stored in DBFS to generate the `pip.conf` file during cluster startup, allowing each cluster its unique auth token. But with init scripts no longer available in the Unit Catalog's **shared mode**, an alternative approach is required.

<!-- more -->

!!! note "I haven't tested all of the methods below."
    Just tested Method 1 and Method 2. Method 3 and Method 4 are from [here](https://learn.microsoft.com/en-us/azure/databricks/init-scripts/#--migrate-init-scripts-from-dbfs).

!!! note "Unity Catalog needs Databricks runtime 11.3 LTS or above"

## Method 1: Preparing `pip.conf` file in advance

A workaround involves placing a prepared `pip.conf` in the Databricks workspace and setting the `PIP_CONFIG_FILE` environment variable to point to this file. This method, however, presents security concerns: the `pip.conf` file, containing the auth token, becomes accessible to the entire workspace, potentially exposing it to all users and clusters. See [here](https://github.com/databrickslabs/dbx/issues/739#issuecomment-1730308586) to check this workaround.

In contrast, the Unit Catalog's **single mode** retains init script availability. Here, the pip auth token is stored securely in a vault and accessed via the Databricks secret scope. Upon cluster startup, the init script fetches the token from the vault, generating the `pip.conf` file. This approach is considerably more secure than the shared mode alternative.

## Method 2: Keeping using init scripts but with Azure ADLS Gen2 instead of DBFS

Unit Catalog's **shared mode** does not allow init scripts stored in DBFS. However, the init script can be stored in Azure ADLS Gen2 accessible by [ABFSS](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction-abfs-uri). It is also needed to [configure the credentials](https://learn.microsoft.com/en-us/azure/databricks/connect/storage/azure-storage) to connect to Azure ADLS Gen2.

Ref to this [PDF file](https://learn.microsoft.com/en-us/azure/databricks/_extras/documents/azure-init-adls.pdf)for details.

Databricks runtimes from 11.3 LTS to 13.3 LTS (13.3 not included) might be not supported, as not tested yet.

## Method 3: Keeping using init scripts in DBFS with allowlist

Refer to [this link](https://learn.microsoft.com/en-us/azure/databricks/release-notes/runtime/13.3lts#allowlist-for-init-scripts-jars-and-maven-coordinates-on-unity-catalog-shared-clusters-is-in-public-preview), And be aware that this feature is only available in Databricks runtime 13.3 LTS or above.

## Method 4: Keeping using init scripts but with UC volume instead of DBFS

Refer to this [PDF file](https://learn.microsoft.com/en-us/azure/databricks/_extras/documents/azure-init-volumes.pdf) for details. And be aware that this feature is only available in Databricks runtime 13.3 LTS or above.
