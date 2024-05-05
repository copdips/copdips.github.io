---
authors:
- copdips
categories:
- python
- file
- spark
comments: true
date:
  created: 2024-05-05
---

# Convert json to parquet and send to Azure Blob Storage

Load a local json file into a PyArrow table, then write it to a parquet file in Azure Blob Storage without using pandas.

<!-- more -->

```python title="with pyarrow only without pandas"
# pip install adlfs pyarrow
# https://arrow.apache.org/docs/python/parquet.html#reading-from-cloud-storage

from os import environ

import pyarrow as pa
import pyarrow.parquet as pq
from adlfs import AzureBlobFileSystem


json_file = "aaa.json"
blob_connection_string = environ["AZURE_BLOB_CONNECTION_STRING"]
blob_container_name = "bbb"

table = pa.Table.from_json(source_file)

abfs = AzureBlobFileSystem(connection_string=blob_connection_string)

pq.write_table(
    table,
    f"{blob_container_name}/another_folder/output.parquet",
    filesystem=abfs
)
```
