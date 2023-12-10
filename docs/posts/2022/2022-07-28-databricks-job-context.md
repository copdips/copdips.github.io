---
authors:
- copdips
categories:
- databricks
- azure
comments: true
date:
  created: 2022-07-28
description: Giving an example of Databricks job/task json context values
---

# Databricks job/task context

Suppose we're running following job/task in a Azure Databricks workspace:

```yaml
jobId: "1111"
jobRunId: "2222"
taskRunId: "3333"
jobName: "ths job name"
taskName: "first-task"
databricksWorkspaceUrl: https://adb-4444444444.123.azuredatabricks.net/
```

Run below command in a Databricks job (task precisely):

```bash
dbutils.notebook.entry_point.getDbutils().notebook().getContext().toJson()
```

We will get following json:

```json
{
    "rootRunId": null,
    "currentRunId": null,
    "jobGroup": "7777777777777777777_8888888888888888888_job-1111-run-3333-action-9999999999999999",
    "tags": {
        "jobId": "1111", # job id
        "jobName": "ths job name",
        "jobClusterKey": "ths job name",
        "multitaskParentRunId": "2222", # this is the job run id
        "taskKey": "first-task", # task name
        "jobRunOriginalAttempt": "3333", # first task run id
        "jobRunAttempt": "3333",
        "idInJob": "3333",
        "runId": "3333", # current task run id, could be different to `jobRunOriginalAttempt` if retry on failure
        "jobOwnerId": "01010101010101",
        "opId": "ServerBackend-5fe4478cdfb206ba",
        "jobFallbackOndemand": "true",
        "opTarget": "com.databricks.backend.common.rpc.InternalDriverBackendMessages$StartRepl",
        "taskDependencies": "[]",
        "eventName": "runExecution",
        "serverBackendName": "com.databricks.backend.daemon.driver.DriverCorral",
        "projectName": "driver",
        "jobClusterNumContainers": "1",
        "jobMiscMessage": "In run",
        "jobTriggerTime": "1659015591689",
        "buildHash": "a2e5769182f120d638a865bc99430452da7670de",
        "effectiveSparkVersion": "",
        "sparkVersion": "",
        "userProvidedSparkVersion": "10.4.x-cpu-ml-scala2.12",
        "jobTriggerSource": "DbScheduler",
        "host": "1.2.3.4",
        "clusterId": "0728-133953-i3676wgl",
        "hostName": "0728-133953-i3676wgl-1-2-3-4",
        "jettyRpcJettyVersion": "9",
        "orgId": "4444444444", # the id in the Databricks workspace url https://adb-{orgId}.{randomNumber}.azuredatabricks.net/
        "jobType": "NORMAL",
        "jobTimeoutSec": "0",
        "maxConcurrentRuns": "10",
        "rootOpId": "ServiceMain-1ffca09fcc660002",
        "jobClusterType": "job_cluster",
        "executorName": "ActiveRunMonitor-job-run-pool",
        "jobUseSpot": "true",
        "jobTerminalState": "Running",
        "userId": "01010101010101", # user id in Databricks, same as jobOwnerId in this example as the job is running by the job owner
        "jobTriggerId": "0",
        "opType": "ServerBackend",
        "jobTriggerType": "manual",
        "jobTaskType": "python",
        "isGitRun": "false",
        "user": "00000000-0000-0000-0000-000000000000", # user name or sp id, or etc.
        "parentOpId": "RPCClient-1ffca09fcc6602f4",
        "jettyRpcType": "InternalDriverBackendMessages$DriverBackendRequest"
    },
    "extraContext": {
        "notebook_path": "dbfs:/dbx/my_repo_unique_name/f80372effd494fd79d3831d69fb5d3cd/artifacts/repo_name/tasks/first/entrypoint.py",
        "api_url": "https://westeurope.azuredatabricks.net", # ! This is not the Databricks workspace URL where the job is running, I find nowhere having the full Databricks workspace URL, `orgId` is not enough, as there's a random number right after it in the URL.
        "api_token": "[REDACTED]",
        "non_uc_api_token": ""
    },
    "credentialKeys": [
        "adls_aad_token",
        "adls_gen2_aad_token",
        "synapse_aad_token"
    ]
}
```
