---
last_modified_at: 2022-04-22 13:22:53
title: "Azure pipeline variables and parameters"
excerpt: ""
tags:
  - azure
  - cicd
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

## Variable

### Variable scope

When we set variables [from a script](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch#set-a-job-scoped-variable-from-a-script), the new variable is only available from the next step, not the step where the variable is defined.

```yml
variables:
  sauce: orange
steps:
# Create a variable
- bash: |
    echo "##vso[task.setvariable variable=sauce]crushed tomatoes" # remember to use double quotes
    echo inside of the same step, sauce: $(sauce)

# Use the variable
# "$(sauce)" is replaced by the contents of the `sauce` variable by Azure Pipelines
# before handing the body of the script to the shell.
- bash: |
    echo from the next step, sauce: $(sauce)
```

The result will be:

```bash
inside of the same step, sauce: orange
from the next step, sauce: crushed tomatoes
```

### Json Variable

Pamameter can have object type like dict in Python, but not the case for variable. The workaround is to assign a raw json string to variable, and using tools like jq to handle it during runtime. The json string variable must follow some special format, the double quotes must be escaped, and the whole string must be enclosed by the single quote.

```yml
aJsonVar: '{ \"dev\": \"foo\", \"prd\": \"bar\" }'
```

## Parameter

### Object parameter

Parameter has a type of [`object`](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script#parameter-data-types) which can take any YAML structure. If it's related to a `array/list` type, we can use `${{ each element in paramters.elements}}` to loop through it, but if it's releated to a `mapping/dict` type, it will not be easy as Microsoft [hasn't provided any official docs](https://github.com/microsoft/azure-pipelines-yaml/issues/427) (and [this one](https://stackoverflow.com/a/59987335/5095636)) on how to use complex paramter with the pipeline native syntax, and my tests with different approaches failed too. Hopefully, for `mapping/dict` object type of parameter, we can workaround it by doing some transformation in a script task with [convertToJson](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops#converttojson) like: `echo "${{ convertToJson(parameters.elements) }}"`

### Loop through parameters

We can [loop through parameters](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script#loop-through-parameters) with:

```yaml
steps:
- ${{ each parameter in parameters }}:
  - script: echo ${{ parameter.Key }}
  - script: echo ${{ parameter.Value }}
```
