---
authors:
- copdips
categories:
- python
- azure
- databricks
- spark
- pandas
- debug
comments: true
date:
  created: 2024-11-22
---

# Databricks Connect

Databricks Connect allows you to connect your favorite IDE (PyCharm, VSCode, etc.) and other custom applications to Databricks compute and run Spark (or non-Spark) code.

This post is not a comprehensive guide on Databricks Connect; rather, it consists of side notes from the [Azure Databricks docs](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/). Most of the notes also apply to Databricks on AWS and GCP.

<!-- more -->

## Network

Databricks Connect ([Spark Connect](https://spark.apache.org/spark-connect/) behind the scenes) communicates with the Databricks Clusters via gRPC over HTTP/2. [More details](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/advanced#additional-http-headers).

## Requirements

- Azure Databricks account and workspace with Unity Catalog enabled
- Databricks cluster runtime 13.3 LTS with UC enabled or above
- The cluster must use a cluster access mode of Assigned or Shared. See [Access modes](https://learn.microsoft.com/en-us/azure/databricks/compute/configure#access-mode)
- For serverless compute, Databricks Connect 15.1 or above is required

[More details](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/cluster-config#requirements).

## Limitations

As of 2024-11-16, see [limitations](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/limitations).

## Conflict with PySpark

Databricks Connect is [not compatible with PySpark](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/install#install-the-databricks-connect-client-with-venv). If you have PySpark installed, you need to uninstall it before installing Databricks Connect.

```bash
pip uninstall pyspark
```

## VSCode

VSCode has a Databricks extension that can guide you to [set up Databricks Connect](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/vscode-ext/databricks-connect).

## Authentication

Install the [Databricks CLI](https://docs.databricks.com/en/dev-tools/cli/index.html).

### List all profiles

```bash
databricks auth profiles
```

### View a single profile

```bash
databricks auth env --profile dev
```

### Set up OAuth2 token with bind to a cluster

```bash
databricks auth login --configure-cluster --host <workspace-url>
databricks auth login --host https://adb-000000.11.azuredatabricks.net/
```

### Create Azure Databricks personal access token

```bash
# omit --lifetime-seconds to create a token that never expires
databricks tokens create --comment <comment> --lifetime-seconds <lifetime-seconds> -p <profile-name>
databricks tokens create --comment test -p dev
```

### Generate a new OAuth2 token (expires in 1 hour)

```bash
databricks auth token -p dev
```

Token info:

```json
{
  "kid": "207a7be08f20c40d6e0fe6ef7369a81631b1e49b1853ee5ac08f3cf79fee15f2",
  "typ": "at+jwt",
  "alg": "RS256"
}.{
  "client_id": "databricks-cli",
  "scope": "offline_access all-apis",
  "iss": "https://adb-000000.11.azuredatabricks.net/oidc",
  "aud": "000000",
  "sub": "xiang.zhu@outlook.com",
  "iat": 1731161434,
  "exp": 1731165034,
  "jti": "469fa7b0-c0c2-4fe8-85a8-5de63a5a59e2"
}.[Signature]
```

## Testing connection

```bash
# https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/cluster-config#programmatic-validation
databricks-connect test
```

## Spark Session

### IPython with VSCode Databricks Extension

When running IPython with Databricks Connect, you might already have an IPython startup script configured by Databricks Connect. In such cases, a `spark` global variable is already available in IPython. This spark session is created by `spark: SparkSession = DatabricksSession.builder.getOrCreate()`.

Be cautious when using IPython with the VSCode Databricks extension installed, as you might already have a spark session created. This spark session is bound to the current target shown in the VSCode Databricks extension. In IPython, you cannot alter the spark session once it is created, even `spark = DatabricksSession.builder.profile("another_profile").getOrCreate()` doesn't raise an error. However, in the standard Python REPL, it's OK. Always use `spark.client.host` to check the current spark session Databricks host. You have automatically env vars: `os.environ['DATABRICKS_CLUSTER_ID']`, `os.environ['DATABRICKS_HOST']`, etc., available in IPython, populated from the file `/home/xiang/git/repo_name/.databricks/.databricks.env`.

Reference: <https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/notebooks#limitations>

IPython startup script example: `/home/xiang/.ipython/profile_default/startup/00-databricks-init-521d4d873faf4188b22df93d8b79802b.py`

This file is created by the [VSCode Databricks extension](https://marketplace.visualstudio.com/items?itemName=databricks.databricks):

```bash
22:59 $ find ~ -type f -name 00-databricks-init-521d4d873faf4188b22df93d8b79802b.py
/home/xiang/.vscode-server/extensions/databricks.databricks-2.4.8-linux-x64/resources/python/generated/databricks-init-scripts/00-databricks-init-521d4d873faf4188b22df93d8b79802b.py
/home/xiang/.ipython/profile_default/startup/00-databricks-init-521d4d873faf4188b22df93d8b79802b.py
```

As this startup script is called each time IPython is started, even for repos that don't have anything to do with Databricks, it will throw an error if it cannot find the `.databricks.env` file. So it's better to hack the startup script a bit:

```diff title="/home/xiang/.ipython/profile_default/startup/00-databricks-init-521d4d873faf4188b22df93d8b79802b.py"
...
try:
    import sys

    print(sys.modules[__name__])
    if not load_env_from_leaf(os.getcwd()):
+       print(f"\n{'='*40}\nNo .databricks.env file found in the current directory or any of its parents.\n{'='*40}\n")
-       sys.exit(1)
+       # sys.exit(1)
+   else:
-   cfg = LocalDatabricksNotebookConfig()
+        cfg = LocalDatabricksNotebookConfig()
...
```

### Use Serverless Compute

```python
from databricks.connect import DatabricksSession as SparkSession

spark = DatabricksSession.builder.serverless(True).getOrCreate()
```

The serverless compute session times out after 10 minutes of inactivity. After this, a new Spark session must be created to connect to serverless compute. This can be done with `spark = DatabricksSession.builder.serverless(True).getOrCreate()`.

### Use DEFAULT Profile

```python
from pyspark.sql import SparkSession, DataFrame

def get_spark() -> SparkSession:
  try:
    from databricks.connect import DatabricksSession
    return DatabricksSession.builder.getOrCreate()
  except ImportError:
    return SparkSession.builder.getOrCreate()

spark = get_spark()
print(spark.client.host)
print(spark.client._user_id)
```

### Use a Specific Host with remote()

```python
from databricks.connect import DatabricksSession

spark = DatabricksSession.builder.remote(
   host       = f"https://{retrieve_workspace_instance_name()}",
   token      = retrieve_token(),
   cluster_id = retrieve_cluster_id()
).getOrCreate()
```

### Use a Specific Profile with sdkConfig()

```python
from databricks.connect import DatabricksSession
from databricks.sdk.core import Config

config = Config(
   profile    = "<profile-name>",
   cluster_id = retrieve_cluster_id()
)

spark = DatabricksSession.builder.sdkConfig(config).getOrCreate()
```

### Use a Specific Profile with profile()

```python
from databricks.connect import DatabricksSession

spark = DatabricksSession.builder.profile("dev-spn-da").getOrCreate()
```

## dbutils

Currently, [only dbutils.fs, dbutils.secrets, and dbutils.widgets are supported](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/databricks-utilities) in the Databricks Python SDK dbutils.

To [enable `dbutils.widgets`](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/vscode-ext/notebooks#notebook-globals), you must first install the package `pip install 'databricks-sdk[notebook]'`.

```python
def get_dbutils():
    if "dbutils" not in globals():
        from databricks.sdk import WorkspaceClient
        w = WorkspaceClient()
        dbutils = w.dbutils
    return dbutils
```

## Displaying dataframe

- <https://spark.apache.org/docs/latest/api/python/getting_started/quickstart_df.html#Viewing-Data>
- <https://stackoverflow.com/a/74729479/5095636>

You can set the config `spark.conf.set('spark.sql.repl.eagerEval.enabled', True)`. This will allow displaying native PySpark DataFrames without explicitly using `df.show()`, and there is no need to transfer DataFrames to Pandas either. All you need to do is just `df`.

## Current Cluster

```python
spark.conf.get("spark.databricks.clusterUsageTags.clusterName")
spark.conf.get("spark.databricks.clusterUsageTags.clusterId")
```

## spark-shell

```bash
DATABRICKS_CLUSTER_ID={cluster_id} pyspark
spark.range(1,10).show()
```

## Interrupting Long Running Query for Cost-Saving

- Databricks Connect for Databricks Runtime 14.0 and above.
- Use a thread as a timer to interrupt the query.

[More details](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/async).

## Logging

Setting the environment variable `SPARK_CONNECT_LOG_LEVEL=debug` will modify this default and print all log messages at the DEBUG level and higher. [More details](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/advanced#logging-and-debug-logs).

## Debugging

[Turn Python code into a Notebook](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/vscode-ext/run#notebook-job) by keeping the `.py` extension and adding `# Databricks notebook source` at the beginning of the file.

Then there'll be a `Run Cell | Run Below | Debug Cell` option appears in the context menu. Clicking on it will open a interactive notebook like editor in VSCode. And `spark = DatabricksSession.builder.getOrCreate()` will return the spark session connected to remote Databricks cluster.

## Pytest

The [official doc](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/vscode-ext/pytest) uses Pytest and VSCode to upload source files to the Databricks workspace and run tests directly from the Databricks cluster. We need to configure VSCode `launch.json` and run the tests by the debug command (shortcut `F5` in VSCode). This will upload the source files to the Databricks workspace and run the tests on the Databricks cluster directly with full compatibility.

However, as Databricks Connect is installed, we can run the tests locally with Databricks Connect (with some [limitations](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/limitations)).

We can achieve this in several ways:

### Setting the environment variable `DATABRICKS_CLUSTER_ID` to the cluster id

```bash
DATABRICKS_CLUSTER_ID={cluster_id} pytest
```

### Running pytest with `ipython -m pytest`

As IPython with the Databricks VSCode extension has a startup script that already sets up the spark session.

```bash
ipython -m pytest
```

### Setting up the spark session as a pytest fixture in conftest

```python title="file tests/conftest.py"
import os

import pytest
from databricks.connect import DatabricksSession
from pyspark.sql import SparkSession


@pytest.fixture
def spark(scope="session") -> SparkSession:
    _ = os.environ.setdefault("DATABRICKS_CLUSTER_ID", {cluster_id})
    return DatabricksSession.builder.getOrCreate()
```

Then just run `pytest` in the terminal.

### Use `pytest-env` to set the environment variable in `pyproject.toml`

```toml title="pyproject.toml"
[tool.pytest_env]
DATABRICKS_CLUSTER_ID = {value = "{cluster_id}", skip_if_set = true}
```

If we need to change the cluster_id, we can use `DATABRICKS_CLUSTER_ID={cluster_id} pytest`.

## Environment Variables

As per this [Github issue](https://github.com/databricks/databricks-vscode/issues/1462), to set environment variables, follow these steps based on the launch type specified in `.vscode/launch.json`:

1. For `"type": "python"` or `"type": "debugpy"`:

      1. Set `python.envFile` in `settings.json` and create a `.env` file in the workspace folder. [More details](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/vscode-ext/settings).
      2. Add a configuration with `"type": "python"` or `"type": "debugpy"` in `.vscode/launch.json`. (see the example below)
      3. Run the debug configuration. This will read the `.env` file.

2. For `"type": "databricks"`:
      1. In `.vscode/launch.json`, under the configuration with `"type": "databricks"`, add the `env` key with the environment variables. (see the example below)

```json title=".vscode/launch.json"
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python Debugger (python): Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      // read local .env file
      "databricks": true
    },
    {
      "name": "Python Debugger (debugpy): Current File",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      // read local .env file
      "databricks": true
    },
    {
      "type": "databricks",
      "request": "launch",
      "name": "Run on Databricks",
      "program": "${file}",
      "args": [],
      // read env vars from here
      "env": { "AA": "CC" }
    },
    {
      "type": "databricks",
      "request": "launch",
      "name": "Unit Tests (on Databricks)",
      "program": "${workspaceFolder}/pytest_databricks.py",
      "args": ["."],
      // read env vars from here
      "env": { "AA": "BB" }
    },
  ]
}
```

## VSCode PySpark and Databricks Utils Autocomplete

This will add the file `{workspaceFolder}/.vscode/__builtins__.pyi` with the following content:

```python
# Typings for Pylance in Visual Studio Code
# see https://github.com/microsoft/pyright/blob/main/docs/builtins.md
from databricks.sdk.runtime import *

from databricks.sdk.runtime import *
from pyspark.sql.session import SparkSession
from pyspark.sql.functions import udf as U
from pyspark.sql.context import SQLContext

udf = U
spark: SparkSession
sc = spark.sparkContext
sqlContext: SQLContext
sql = sqlContext.sql
table = sqlContext.table
getArgument = dbutils.widgets.getArgument

def displayHTML(html): ...

def display(input=None, *args, **kwargs): ...
```

[More details](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/vscode-ext/command-palette#autocomplete).

## Python Code Example

```python
from databricks.connect import DatabricksSession

spark = DatabricksSession.builder.getOrCreate()

df = spark.read.table("samples.nyctaxi.trips")
df.show(5)
```

[More examples](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect/python/examples).
