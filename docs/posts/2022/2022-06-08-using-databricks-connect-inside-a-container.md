---
authors:
- copdips
categories:
- databricks
- vscode
- container
- docker
- spark
comments: true
date:
  created: 2022-06-08
description: Using Databricks Connect inside a container with VSCode remote containers
  with spark, jre, python, databricks-connect pre-installed.
---

# Using Databricks Connect inside a container

<!-- more -->

## Why use Databricks Connect

From the very beginning of the Databricks Connect [official doc](https://docs.databricks.com/dev-tools/databricks-connect.html), it says already that Databricks Connect has some [limitations](https://docs.databricks.com/dev-tools/databricks-connect.html#limitations) and is more or less deprecated in favor of [dbx](https://docs.databricks.com/dev-tools/dbx.html). But for some usages like local IDE live debug, Databricks Connect is still a very good tool where as dbx cannot do it at all. At the time of writing, dbx is mainly a Databricks jobs' API wrapper to deploy and run Databricks jobs.

!!! note "2022-10-15: Spark Connect in favor or Databricks Connect"

    Recently a Databricks [blog](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html) introduced the project [Spark Connect](https://issues.apache.org/jira/browse/SPARK-39375) which aims to do very similar thing as Databricks Connect. This project is still in development, and is a part of Apache Spark, not Databricks specific.

!!! note "2023-12-21: Databricks Connect in favor of Spark Connect"

    It seems that Spark Connect is [still in development](https://issues.apache.org/jira/browse/SPARK-39375), and Databricks Connect is now again the official way to run Spark locally. However, it requires [Databricks runtime 13.0 or above](https://docs.databricks.com/en/dev-tools/databricks-connect/python/index.html).

A very important point to be taken into account is that if we plan to deploy production ready Databricks workflows, it's recommended to use `dbx`. currently it's not official supported by Databricks (version number starts with 0), but it's good enough to use, I've already used it since several months. And as it's a deployment tool, even if it bugs, it will be much less dangerous for production.

Just a quick helper information of `dbx`:

```bash
$ dbx --version
[dbx][2022-10-15 22:43:24.265] 🧱Databricks eXtensions aka dbx, version ~> 0.7.6

$ dbx --help

 Usage: dbx [OPTIONS] COMMAND [ARGS]...

 🧱Databricks eXtensions aka dbx. Please find the main docs page here.

╭─ Options ──────────────────────────────────────────────────────────────────────────╮
│ --version                                                                          │
│ --install-completion          Install completion for the current shell.            │
│ --show-completion             Show completion for the current shell, to copy it or │
│                               customize the installation.                          │
│ --help                        Show this message and exit.                          │
╰────────────────────────────────────────────────────────────────────────────────────╯
╭─ Commands ─────────────────────────────────────────────────────────────────────────╮
│ configure  🔧 Configures project environment in the current folder.                │
│ deploy     📦 Deploy project to artifact storage.                                  │
│ destroy    🚮 Delete defined workflows and relevant assets.                        │
│ execute    🔥 Executes chosen workload on the interactive cluster.                 │
│ init       💎 Generates new project from the template.                             │
│ launch     🚀 Launch the workflow on a job cluster.                                │
│ sync       🔄 Sync local files to Databricks and watch for changes.                │
╰────────────────────────────────────────────────────────────────────────────────────╯
```

## Using Databricks Connect outside a container

Just follow the [official guide](https://docs.databricks.com/dev-tools/databricks-connect.html).

## Using Databricks Connect inside a container

VSCode has a very nice feature that enable us to [develop inside a container](https://code.visualstudio.com/docs/remote/containers). As Databricks Connect needs some setup, we can leverage this feature to prepare a container that having everything pre-configured. When we need to do a live debug, just connect VSCode to the container, then set some breakpoints and start the debug.

We need following folder and files to use VSCode remote container:

```bash
.databricks-connect.template
.devcontainer/
├── Dockerfile
└── devcontainer.json
databricks_demo_job.py
```

And the content of each files:

### .databricks-connect.template

```json
// to find the config values: https://docs.databricks.com/dev-tools/databricks-connect.html#step-2-configure-connection-properties

// inside the container, we can use `databricks-connect configure` to create this file, but it takes time, that's why we pre-created this file before container build.

{
  "host": "https://aaa.azuredatabricks.net/",
  "token": "replacetoken",
  "cluster_id": "abc",
  "org_id": "111111",
  "port": "15001"
}
```

### Dockerfile

My test is run in a Databricks cluster with the [runtime 10.4](https://docs.databricks.com/dev-tools/databricks-connect.html#requirements), which is bound to `Python 3.8`. At the time of writing, Databricks only releases a beta version for the runtime 10.4: `databricks-connect==10.4.0b0`. In the future, as per the official doc, it would be better to use the convention `databricks-connect==10.4.*`.

The official doc says also that only `OpenJDK 8 JRE` is supported by the Databricks Connect client. But `default-jre` installed in the Dockerfile is for `python:3.8`, which is bound to `3.8-bullseye`, which means the JRE version is [v11](https://packages.debian.org/bullseye/default-jre). If we encounter some bugs when using Databricks Connect, we might need to install `OpenJDK 8 JRE`.

`ENV SPARK_HOME` is tested from my Python:3.8 image, once in the container, run the command `databricks-connect get-spark-home` to check if it's the same. If not, update the Dockerfile.

```dockerfile
# https://github.com/microsoft/vscode-dev-containers/blob/main/containers/python-3/.devcontainer/Dockerfile

# [Choice] Python version (use -bullseye variants on local arm64/Apple Silicon): 3, 3.10, 3.9, 3.8, 3.7, 3.6, 3-bullseye, 3.10-bullseye, 3.9-bullseye, 3.8-bullseye, 3.7-bullseye, 3.6-bullseye, 3-buster, 3.10-buster, 3.9-buster, 3.8-buster, 3.7-buster, 3.6-buster

ARG VARIANT="3.8"
FROM mcr.microsoft.com/vscode/devcontainers/python:${VARIANT}

ARG DEV_DATABRICKS_TOKEN

COPY .databricks-connect.template /home/vscode/.databricks-connect

RUN && sudo apt update \
    && sudo apt-get install -y default-jre \
    && pip install databricks-connect==10.4.0b0 \
    && pip install -U pip \
    && sed -i "s/replacetoken/${DEV_DATABRICKS_TOKEN}/g" /home/vscode/.databricks-connect

ENV SPARK_HOME /usr/local/lib/python3.8/site-packages/pyspark
```

### devcontainer.json

```json
// Config options: https://aka.ms/devcontainer.json

// File example: https://github.com/microsoft/vscode-dev-containers/blob/main/containers/python-3/.devcontainer/devcontainer.json
{

  "name": "Python 3",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "..",
    "args": {
      // Update 'VARIANT' to pick a Python version: 3, 3.10, 3.9, 3.8, 3.7, 3.6
      // Append -bullseye or -buster to pin to an OS version.
      // Use -bullseye variants on local on arm64/Apple Silicon.
      "VARIANT": "3.10-bullseye",
      "DEV_DATABRICKS_TOKEN": "${localEnv:DEV_DATABRICKS_TOKEN}"
    }
  },

  // Configure tool-specific properties.
  "customizations": {
    // Configure properties specific to VS Code.
    "vscode": {
      // Set *default* container specific settings.json values on container create.
      "settings": {
        "python.defaultInterpreterPath": "/usr/local/bin/python",
        "python.linting.enabled": true,
        "python.linting.pylintEnabled": true,
        "python.formatting.autopep8Path": "/usr/local/py-utils/bin/autopep8",
        "python.formatting.blackPath": "/usr/local/py-utils/bin/black",
        "python.formatting.yapfPath": "/usr/local/py-utils/bin/yapf",
        "python.linting.banditPath": "/usr/local/py-utils/bin/bandit",
        "python.linting.flake8Path": "/usr/local/py-utils/bin/flake8",
        "python.linting.mypyPath": "/usr/local/py-utils/bin/mypy",
        "python.linting.pycodestylePath": "/usr/local/py-utils/bin/pycodestyle",
        "python.linting.pydocstylePath": "/usr/local/py-utils/bin/pydocstyle",
        "python.linting.pylintPath": "/usr/local/py-utils/bin/pylint"
      },

      // Add the IDs of extensions you want installed when the container is created.
      "extensions": ["ms-python.python", "ms-python.vscode-pylance"]
    }
  },

  // Use 'forwardPorts' to make a list of ports inside the container available locally.
  // "forwardPorts": [],

  // Use 'postCreateCommand' to run commands after the container is created.
  // "postCreateCommand": "pip3 install --user -r requirements.txt",

  // Comment out to connect as root instead. More info: https://aka.ms/vscode-remote/containers/non-root.
  "remoteUser": "vscode"
}
```

### databricks_demo_job.py

```python
# example taken from: https://docs.databricks.com/dev-tools/databricks-connect.html#access-dbutils

from pyspark.sql import SparkSession
from pyspark.dbutils import DBUtils

spark = SparkSession.builder.getOrCreate()

dbutils = DBUtils(spark)
print(dbutils.fs.ls("dbfs:/"))
print(dbutils.secrets.listScopes())
```

### env var DEV_DATABRICKS_TOKEN

As you can see, in the file `.databricks-connect.template`, there's a line `"token": "replacetoken",`.
In fact, during the build of the Dockerfile, it will replace the string `replacetoken` by the value of the env var `DEV_DATABRICKS_TOKEN`. So we need to create this env var in advance.

### Test

1. From VSCode, type `F1`, choose `Remote-Containers: Reopen in Container`, VSCode will open a new instance. If you check the lower left corner of VSCode, you'll see `Dev Container: Python 3`.
2. Run `cat ~/.databricks-connect`, you should see the correct config.
3. Run `databricks-connect test`, it should not raise any error, and might have the phrase `* All tests passed.` in the end. If the cluster is not started yet, it could take some time during this step.
4. Set a breakpoint in the file `databricks_demo_job.py`, type `F5`, have fun.
