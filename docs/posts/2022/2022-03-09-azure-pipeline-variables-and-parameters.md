---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-03-09
  updated: 2022-06-16
description: ''
---

# Azure pipeline variables and parameters

<!-- more -->

## Variable

### Variable scope

When we set variables [from a script](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch#set-a-job-scoped-variable-from-a-script), the new variable is only available from the next step, not the step where the variable is defined.

```yaml
variables:
  sauce: orange
steps:
# Create a variable
- bash: |
    echo "##vso[task.setvariable variable=sauce]crushed tomatoes" # remember to use double quotes
    echo inside the same step, sauce: $(sauce)

# Use the variable
# "$(sauce)" is replaced by the contents of the `sauce` variable by Azure Pipelines
# before handing the body of the script to the shell.
- bash: |
    echo from the next step, sauce: $(sauce)
```

The result will be:

```bash
inside the same step, sauce: orange
from the next step, sauce: crushed tomatoes
```

### Json Variable

Parameter can have object type like dict in Python, but not the case for variable. The workaround is to assign a raw json string to variable, and using tools like [jq](https://stedolan.github.io/jq/) to handle it during runtime. The json string variable must follow some special format, the double quotes must be escaped, and the whole string must be enclosed by the single quote.

```yaml
aJsonVar: '{ \"dev\": \"foo\", \"prd\": \"bar\" }'
```

## Parameter

### String parameter

For string parameter with an empty string `""` as default value, in bash script task, we can use `if [[ -n $VAR_NAME ]]; then` to handle it.

`-n` in Linux returns true (0) if exists, and not empty.

```yaml
parameters:
  - name: paramName
    type: string
    default: ""

steps:
  - scripts: |
      if [[ -n $PARAM_NAME ]]; then
        echo PARAM_NAME is set with a value: $PARAM_NAME
      fi
    displayName: check paramName
    failOnStderr: true
    env:
      PARAM_NAME: ${{ parameters.paramName }}
```

### Boolean parameter

```yaml
parameters:
- name: myBoolean
  type: boolean
  default: true
```

- In pipeline YAML syntax, we compare the value by YAML's Boolean type `true` or `false`
- In bash script, we should compare it with string format of `True` or `False`

### Object parameter

Parameter has a type of [`object`](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script#parameter-data-types) which can take any YAML structure. If it's related to a `array/list` type, we can use `${{ each element in paramters.elements}}` to loop through it, but if it's related to a `mapping/dict` type, it will not be easy as Microsoft [hasn't provided any official docs](https://github.com/microsoft/azure-pipelines-yaml/issues/427) (and [this one](https://stackoverflow.com/a/59987335/5095636)) on how to use complex parameter with the pipeline native syntax, and my tests with different approaches failed too. Hopefully, for `mapping/dict` object type of parameter, we can workaround it by doing some transformation in a script task with [convertToJson](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops#converttojson) like: `echo '${{ convertToJson(parameters.elements) }}'`

!!! warning

    Must use `single quotes` around the `convetToJson` expression. If we use `double quotes`, the output will [remove the double quotes from the json data](https://github.com/MicrosoftDocs/azure-devops-docs/issues/11983#issuecomment-1055651836).

### Loop through parameters

We can [loop through parameters](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script#loop-through-parameters) with:

```yaml
steps:
- ${{ each parameter in parameters }}:
  - script: echo ${{ parameter.Key }}
  - script: echo ${{ parameter.Value }}
```

The above example provided by the official doc loops through the parameters script by script.
In the pipeline, we will see as many tasks as the number of parameters which looks a bit heavy, hereunder how to iterate all the parameters in a single script.

```yaml
# suppose the blow pipeline is defined in a template which takes the parameter with name `parameters`, so we can reuse it in any other pipelines.
parameters:
  - name: parameters
    displayName: parameters
    type: object

steps:
  - script: |
      parameters_in_json=$(echo '${{ convertToJson(parameters.parameters) }}' | jq -c)
      echo "##vso[task.logissue type=warning]parameters: $parameters_in_json"
    displayName: echo parameters
```

The above example uses only one script to iterate all the parameters and pipe it to [jq](https://stedolan.github.io/jq/), as long as jq can handle the parameters, we can handle everything.
Here, we use `jq -c` to convert all the parameters into a single line json, which will be better displayed by `##vso[task.logissue type=warning]`, as it takes only one line.
