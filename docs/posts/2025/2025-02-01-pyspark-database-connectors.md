---
authors:
- copdips
categories:
- python
- spark
- database
comments: true
date:
  created: 2025-02-01
---

# PySpark database connectors

## General

Use `spark.jars` to add local ODBC/JDBC drivers to PySpark, and use `spark.jars.packages` to add remote ODBC/JDBC drivers, PySpark will download the packages from Maven repository.

For `spark-shell`: https://docs.snowflake.com/en/user-guide/spark-connector-install#installing-additional-packages-if-needed

```python linenums="1" hl_lines="5 9"
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder.config(
        "spark.jars",
        "/home/xiang/src/sqljdbc_12.8/enu/jars/mssql-jdbc-12.8.1.jre11.jar",
    )
    .config(
        "spark.jars.packages",
        "net.snowflake:snowflake-jdbc:3.13.22,net.snowflake:spark-snowflake_2.12:2.12.0-spark_3.4",
    )
    .getOrCreate()
)
```

!!! note "In Databricks, normally we don't need to add ODBC/JDBC drivers manually, as we can configure the cluster (in the Advanced Options tab) to install the drivers automatically."

!!! note "pay attention to the compatibility among JAVA version, spark version, PySpark version, and the JDBC driver version."
    Normally, jdk 11 is good for Spark 3.4 and 3.5, so as to PySpark, but many JDBC drivers are not compatible with Spark 3.5 yet as of 2024. So everything around Spark 3.4 is a good choice.

## Microsoft SQL Server

1. Download the JDBC driver from [Microsoft](https://learn.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server). Suppose it's downloaded to `~/src/sqljdbc_12.8.1.0_enu.tar.gz`.
2. `cd ~/src && tar -xvf sqljdbc_12.8.1.0_enu.tar.gz`
3. Add jdbc driver as spark jars in PySpark code:

    ```python
    from pyspark.sql import SparkSession

    spark = (
        SparkSession.builder.config(
            "spark.jars",
            "/home/xiang/src/sqljdbc_12.8/enu/jars/mssql-jdbc-12.8.1.jre11.jar",
        )
        .getOrCreate()
    )

    """
    # or:

    spark = (
    SparkSession.builder
    .config(
        "spark.jars.packages",
        "com.microsoft.sqlserver:mssql-jdbc:12.8.1.jre11",
        # old not maintained driver: "com.microsoft.azure:spark-mssql-connector_2.12:1.3.0-BETA",
    )
    .getOrCreate()
    )

    # or:

    spark = (
        SparkSession.builder
        .config(
            "spark.driver.extraClassPath",
            "/home/xiang/src/sqljdbc_12.8/enu/jars/mssql-jdbc-12.8.1.jre11.jar",
        )
        .config(
            "spark.executor.extraClassPath",
            "/home/xiang/src/sqljdbc_12.8/enu/jars/mssql-jdbc-12.8.1.jre11.jar",
        )
        .getOrCreate()
    )
    """"

    spark.read.format("jdbc")
    .options(
        # ! parameter `driver` is not needed for Databricks environment,
        # here is for local testing and only works when jar is specified by spark.jars, and not by spark.driver.extraClassPath, and spark.executor.extraClassPath
        driver="com.microsoft.sqlserver.jdbc.SQLServerDriver",
        url=url,
        dbtable=f"dbo.my_table",
        authentication="SqlPassword",
        user=user,
        password=password,
    )
    .load()
    ```

## Snowflake

Ref: <https://docs.snowflake.com/en/user-guide/spark-connector-install#step-4-configure-the-local-spark-cluster-or-amazon-emr-hosted-spark-environment>

```python
# https://docs.databricks.com/en/connect/external-systems/snowflake.html
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .config(
        # download on live the jdbc driver
        "spark.jars.packages",
        "net.snowflake:snowflake-jdbc:3.13.22,net.snowflake:spark-snowflake_2.12:2.12.0-spark_3.4",
    )
    .getOrCreate()
)

sf_params = {
    "sfURL": "account_name.snowflakecomputing.com",
    "sfUser": "user",
    "sfPassword":"password",
    "sfDatabase": "database",
    "sfSchema": "schema",
    "sfWarehouse": "warehouse",
    "sfRole": "role",
}
query = "select * from database.schema.table"
spark.read.format("snowflake").options(**sf_params).option("query", query).load()
```
