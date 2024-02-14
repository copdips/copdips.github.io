---
authors:
- copdips
categories:
- debug
- azure
comments: true
date:
  created: 2024-02-14
---

# Debugging in vscode

<!-- more -->

## Debugging Azure Functions

VSCode with [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-python) can create `settings.json`, `launch.json`, and `tasks.json` files for you inside the `.vscode` folder.
However, at the time of writing (2024-02-14), it only works if the project is flat under the root of the workspace.
If you have a project structure like this `./app/function_app.py`, where the function files are under a subfolder `app`, you need to tweak the JSON settings.

!!! note "`pdb` and `ipdb` don't work for Azure Functions"
    Or I don't know how to make them work, `debugpy` might work, but I have to test. But hopefully, at least the following settings for GUI debugging will work for you.

### Project structure

Suppose you have a Azure Functions Python v2 project structure like this:

```console title="tree -a -I '.venv|.git|.*_cache|*.pyc'"
.
├── README.md
├── .git
├── .venv
├── .vscode
│   ├── extensions.json
│   ├── launch.json
│   ├── settings.json
│   └── tasks.json
├── app
│   ├── __init__.py
│   ├── func1
│   │   └── __init__.py
│   │   └── func_1.py
│   ├── func2
│   │   └── __init__.py
│   │   └── func_2.py
│   └── utils
│   │   └── __init__.py
│   │   └── utils.py
│   ├── function_app.py
│   ├── host.json
│   ├── local.settings.json
│   ├── requirements.txt
```

### Command line debugging

VSCode recommends to use [debugpy](https://code.visualstudio.com/docs/python/debugging#_install-debugpy) for command line debugging, and the UI Debug has debugpy preinstalled in the VSCode Python extension.

```bash title="install debugpy for command line deugging"
pip install -U debugpy
```

### .vscode/settings.json

```json title=".vscode/settings.json"
{
  "azureFunctions.deploySubpath": "app",
  "azureFunctions.scmDoBuildDuringDeployment": true,
  "azureFunctions.pythonVenv": "${workspaceFolder}/.venv",
  "azureFunctions.projectLanguage": "Python",
  "azureFunctions.projectRuntime": "~4",
  "debug.internalConsoleOptions": "neverOpen",
}
```

!!! note "`azureFunctions.pythonVenv` should not be set to `../.venv`"
    When opening VSCode, you'll see a popup saying that "Failed to find Python virtual environment "${workspaceFolder}/.venv", which is expected based on the setting "azureFunctions.pythonVenv". Setting to `../.venv` will remove the popup, but won't work for the debugging. So just ignore the popup warning, and keep `azureFunctions.pythonVenv` as `${workspaceFolder}/.venv`.

### .vscode/launch.json

```json title=".vscode/launch.json"
{
  "version": "0.2.0",
  "configurations": [

    {
      "name": "Current File (Integrated Terminal)",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/${config:azureFunctions.deploySubpath}"
      },
      "justMyCode": false,
    },
    {
      "name": "Azure Functions",
      "type": "debugpy",
      "request": "attach",
      "connect": {
        "host": "localhost",
        "port": 9091
      },
      "preLaunchTask": "func: host start",
      "presentation": {
        "reveal": "always"
      },
      "justMyCode": false,
    },
  ]
}
```

### .vscode/tasks.json

```json title=".vscode/tasks.json"
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "func: host start",
      "type": "func",
      "command": "host start",
      "problemMatcher": "$func-python-watch",
      "isBackground": true,
      "options": {
        "cwd": "${workspaceFolder}/${config:azureFunctions.deploySubpath}",
        // previously, I used this to specify the python interpreter, as VSCode debug only finds the default python interpreter, but not anymore
        // "env": {
        //   "languageWorkers:python:defaultExecutablePath": "${workspaceFolder}/.venv/bin/python",
        // }
      },
      "dependsOn": "pip install (functions)"
    },
    {
      "label": "pip install (functions)",
      "type": "shell",
      "osx": {
        "command": "${config:azureFunctions.pythonVenv}/bin/python -m pip install -r ${workspaceFolder}/inventories/requirements.txt"
      },
      "windows": {
        "command": "${config:azureFunctions.pythonVenv}/Scripts/python -m pip install -r ${workspaceFolder}/inventories/requirements.txt"
      },
      "linux": {
        "command": "${config:azureFunctions.pythonVenv}/bin/python -m pip install -r ${workspaceFolder}/inventories/requirements.txt"
      },
      "problemMatcher": []
    }
  ]
}
```

### app/host.json

```json title="app/host.json"
{
  "version": "2.0",
  "logging": {
    "fileLoggingMode": "debugOnly",
    "logLevel": {
      "default": "Warning",
      "Host": "Error",
      "Function": "Error",
      "Host.Aggregator": "Information"
    },
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### app/local.settings.json

```json title="app/local.settings.json"
{
  "IsEncrypted": false,
  "AzureWebJobsStorage": "UseDevelopmentStorage=false",
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    "AzureWebJobsStorage": "...",
    "FUNCTIONS_EXTENSION_VERSION": "~4",
    "APPINSIGHTS_INSTRUMENTATIONKEY": "...",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "...",
    "ENABLE_ORYX_BUILD": "true",
    "SCM_DO_BUILD_DURING_DEPLOYMENT": "1",
    "BUILD_FLAGS": "UseExpressBuild",
    "XDG_CACHE_HOME": "/tmp/.cache",
    "CosmosDbConnectionString": "..."
  },
  "ConnectionStrings": {}
}
```
