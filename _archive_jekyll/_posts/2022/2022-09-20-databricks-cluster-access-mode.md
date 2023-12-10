---
last_modified_at:
title: "Databricks cluster access mode"
excerpt: ""
tags:
  - azure
  - databricks
  - spark
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

## What is cluster access mode

Just a copy from [Azure Databricks official doc](https://learn.microsoft.com/en-us/azure/databricks/data-governance/unity-catalog/compute#--what-is-cluster-access-mode):

[Amazon Databricks official doc](https://docs.databricks.com/clusters/cluster-ui-preview.html#what-is-cluster-access-mode) has less info on access mode.
{: .notice--info}

| Access Mode           | Visible to user                          | UC Support | Supported Languages   | Notes                                                                                                                        |
| --------------------- | ---------------------------------------- | ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Single User`         | Always                                   | Yes        | Python, SQL, Scala, R | Can be assigned to and used by a single user only. Dynamic views are not supported. Credential passthrough is not supported. |
| `Shared`              | Always (Premium plan required)           | Yes        | Python, SQL           | Init scripts, third-party libraries, and JARS are not supported. Credential passthrough is not supported.                    |
| `No Isolation Shared` | Hidden (Enforce User Isolation required) | No         | Python, SQL, Scala, R | Admin console configuration required to enforce user isolation                                                               |
| `Custom`              | Hidden (For all new clusters)            | No         | Python, SQL, Scala, R | This option is shown only if you have existing clusters without a specified access mode.                                     |

`Single User` mode is easy to understand, the cluster is reserved to a single user, other user cannot use it.

`Custom` mode is often seen in job cluster, which means cluster created by a job running in a cluster pool for example, because when creating a cluster pool, there's no option for access mode.

This post will talk about `Shared` and `No Isolation Shared` access modes.

All the below examples were tested on a cluster with Databricks runtime v10.4 LTS (Scala 2.12 Spark 3.2.1).
{: .notice--info}

## `Shared` access mode

From two different users, running the same command `python -m site`, I got two different results.

* in a notebook from `user1`, the mapped user is `spark-6166cfd7-9154-4017-b0ff-89`:

```python
%%sh
whoami
echo ======
which python
echo ======
python -m site

# outputs:
spark-6166cfd7-9154-4017-b0ff-89
======
/databricks/python3/bin/python
======
sys.path = [
    '/home/spark-6166cfd7-9154-4017-b0ff-89',
    '/databricks/spark/python',
    '/databricks/spark/python/lib/py4j-0.10.9.1-src.zip',
    '/databricks/jars/spark--driver--driver-spark_3.2_2.12_deploy.jar',
    '/WSFS_NOTEBOOK_DIR',
    '/databricks/python_shell',
    '/usr/lib/python38.zip',
    '/usr/lib/python3.8',
    '/usr/lib/python3.8/lib-dynload',
    '/databricks/python3/lib/python3.8/site-packages',
    '/usr/local/lib/python3.8/dist-packages',
    '/usr/lib/python3/dist-packages',
]
USER_BASE: '/home/spark-6166cfd7-9154-4017-b0ff-89/.local' (exists)
USER_SITE: '/home/spark-6166cfd7-9154-4017-b0ff-89/.local/lib/python3.8/site-packages' (doesn't exist)
ENABLE_USER_SITE: True
```

* in a notebook from `user2`, the mapped user is `spark-5a9eefa7-49d3-4176-9805-1e`:

```bash
%%sh
whoami
echo ======
which python
echo ======
python -m site

# outputs:
spark-5a9eefa7-49d3-4176-9805-1e
======
/databricks/python3/bin/python
======
sys.path = [
    '/home/spark-5a9eefa7-49d3-4176-9805-1e',
    '/databricks/spark/python',
    '/databricks/spark/python/lib/py4j-0.10.9.1-src.zip',
    '/databricks/jars/spark--driver--driver-spark_3.2_2.12_deploy.jar',
    '/WSFS_NOTEBOOK_DIR',
    '/databricks/python_shell',
    '/usr/lib/python38.zip',
    '/usr/lib/python3.8',
    '/usr/lib/python3.8/lib-dynload',
    '/databricks/python3/lib/python3.8/site-packages',
    '/usr/local/lib/python3.8/dist-packages',
    '/usr/lib/python3/dist-packages',
]
USER_BASE: '/home/spark-5a9eefa7-49d3-4176-9805-1e/.local' (exists)
USER_SITE: '/home/spark-5a9eefa7-49d3-4176-9805-1e/.local/lib/python3.8/site-packages' (doesn't exist)
ENABLE_USER_SITE: True
```

* Pip install a third party Python module will fail

Below example demonstrates the phrase "*Init scripts, third-party libraries, and JARS are not supported*" in the above table.

```bash
%%sh
pip install requests==2.26.0
# same error message for: `python -m pip install requests==2.26.0 --user`,
# except for there's no the first phrase: "Defaulting to user installation because normal site-packages is not writeable"

Defaulting to user installation because normal site-packages is not writeable
Looking in indexes: https://[REDACTED]:****@[REDACTED]/_packaging/[REDACTED]/pypi/simple/
Collecting requests==2.26.0
  Downloading https://[REDACTED]/_packaging/daa86ee5-06b8-417b-bc88-e64e3e2eef29/pypi/download/requests/2.26/requests-2.26.0-py2.py3-none-any.whl (62 kB)
Requirement already satisfied: certifi>=2017.4.17 in /databricks/python3/lib/python3.8/site-packages (from requests==2.26.0) (2020.12.5)
Requirement already satisfied: urllib3<1.27,>=1.21.1 in /databricks/python3/lib/python3.8/site-packages (from requests==2.26.0) (1.25.11)
Requirement already satisfied: idna<4,>=2.5 in /databricks/python3/lib/python3.8/site-packages (from requests==2.26.0) (2.10)
Collecting charset-normalizer~=2.0.0
  Downloading https://[REDACTED]/_packaging/daa86ee5-06b8-417b-bc88-e64e3e2eef29/pypi/download/charset-normalizer/2.0.12/charset_normalizer-2.0.12-py3-none-any.whl (39 kB)
ERROR: Will not install to the user site because it will lack sys.path precedence to requests in /databricks/python3/lib/python3.8/site-packages
WARNING: You are using pip version 21.0.1; however, version 22.2.2 is available.
You should consider upgrading via the '/databricks/python3/bin/python -m pip install --upgrade pip' command.
CalledProcessError: Command 'b'pip install requests==2.26.0\n'' returned non-zero exit status 1.
```

## `No Isolation Shared` access mode

Update 2023-02-01, I retested the `No Isolation Shared` access mode today, it seems that something has been changed at Databricks level.
{: .notice--warning}

Hereunder the new behavior:

1. The user is still `root`, but the Python binary is not a system one, instead an isolated venv is used, and pip install occurs in the venv too.
2. For the same user, each time we re-attach to the cluster, the venv path is changed. And therefore, previous pip install is discarded.

```python
%%sh
whoami
echo ======
which python
echo ======
python -m site

# outputs:
root
======
/local_disk0/.ephemeral_nfs/envs/pythonEnv-76eac499-b8f2-451c-ac6a-88f9a68fcae7/bin/python
======
sys.path = [
    '/databricks/driver',
    '/databricks/spark/python',
    '/databricks/spark/python/lib/py4j-0.10.9.5-src.zip',
    '/databricks/jars/spark--driver--driver-spark_3.3_2.12_deploy.jar',
    '/WSFS_NOTEBOOK_DIR',
    '/databricks/jars/spark--maven-trees--ml--11.x--graphframes--org.graphframes--graphframes_2.12--org.graphframes__graphframes_2.12__0.8.2-db1-spark3.2.jar',
    '/databricks/python_shell',
    '/usr/lib/python39.zip',
    '/usr/lib/python3.9',
    '/usr/lib/python3.9/lib-dynload',
    '/local_disk0/.ephemeral_nfs/envs/pythonEnv-76eac499-b8f2-451c-ac6a-88f9a68fcae7/lib/python3.9/site-packages',
    '/local_disk0/.ephemeral_nfs/cluster_libraries/python/lib/python3.9/site-packages',
    '/databricks/python/lib/python3.9/site-packages',
    '/usr/local/lib/python3.9/dist-packages',
    '/usr/lib/python3/dist-packages',
    '/databricks/.python_edge_libs',
]
USER_BASE: '/root/.local' (exists)
USER_SITE: '/root/.local/lib/python3.9/site-packages' (doesn't exist)
ENABLE_USER_SITE: False
```

Below is the test result on 2022-09-20:

In contrast to `Shared` mode, within the `No Isolation Shared` mode, running the same commands, I got the same results from two different users.
We can find that all the users are logged as `root` account.

```python
%%sh
whoami
echo ======
which python
echo ======
python -m site

# outputs:
root
======
/databricks/python3/bin/python
======
sys.path = [
    '/databricks/driver',
    '/databricks/spark/python',
    '/databricks/spark/python/lib/py4j-0.10.9-src.zip',
    '/databricks/jars/spark--driver--driver-spark_3.1_2.12_deploy.jar',
    '/WSFS_NOTEBOOK_DIR',
    '/databricks/python_shell',
    '/usr/lib/python38.zip',
    '/usr/lib/python3.8',
    '/usr/lib/python3.8/lib-dynload',
    '/databricks/python3/lib/python3.8/site-packages',
    '/usr/local/lib/python3.8/dist-packages',
    '/usr/lib/python3/dist-packages',
]
USER_BASE: '/root/.local' (exists)
USER_SITE: '/root/.local/lib/python3.8/site-packages' (doesn't exist)
ENABLE_USER_SITE: True
```

* Pip install a third party Python module will succeed

## Conclusion

* `Shared` access mode maps different users to different user space, their environments are isolated, but they cannot install any additional packages or modules.
* `No Isolation Shared` access mode maps all the users to the root account, everything is shared, they can install anything, but the changes imply to all users. **After cluster restart, all the additional installations are purged**. So maybe one project per cluster is a choice.
* Another good choice is to use the `non-interactive job cluster` with a cluster pool, where the cluster pool is shared, but any user can install anything (can be limited by cluster policy), and the installation is isolated at job level. Which means even two jobs are created by the same user, the two jobs will use different environments (VMs with Databricks runtime container re-deployed in the cluster pool after each job run).
