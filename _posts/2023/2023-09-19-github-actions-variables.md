---
last_modified_at:
title: "Github Actions - Variables"
excerpt: ""
tags:
  - cicd
  - githubaction
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

## Parsing variables

### Parsing variables with object type

Workflow :

```yaml
- run: |
    echo "github.event: ${{ github.event }}"
    echo "github.event toJson: $GITHUB_EVENT"
  env:
    GITHUB_EVENT: ${{ toJson(github.event) }}
```

Output:

```bash
github.event: Object
github.event toJson: {
  after: 9da8166fcc52c437871a2e903b3e200a35c09a1e,
  base_ref: null,
  before: 1448cfbf10fc149b7d200d0a0e15493f41cc8896,
  ...
```

{% raw %}`echo "github.event toJson: ${{ toJSON(github.event) }}"`{% endraw %} will [raise error](https://github.com/actions/runner/issues/1656#issuecomment-1030077729), must parse the variable to environment variable `$GITHUB_EVENT` at first. So when using `toJson` method to parse object type variable, it is recommended to send the value to an environment variable first.
{: .notice--warning}

### Parsing variables with boolean type

Check with `if`:

{% raw %}

```yaml
on:
  workflow_dispatch:
    inputs:
      print_tags:
        description: 'True to print to STDOUT'
        required: true
        type: boolean

jobs:
  print-tag:
    runs-on: ubuntu-latest
    # all the 4 syntaxes below are valid
    if: inputs.print_tags
    if: ${{ inputs.print_tags }}
    if: inputs.print_tags == true
    if: ${{ inputs.print_tags == true}}
    steps:
      - name: Print the input tag to STDOUT
        run: echo The tags are ${{ inputs.tags }}
      - name: Print the input tag to STDOUT
        # in bash, compare boolean with string value
        run: |
          if [[ "${{ inputs.print_tags }}" == "true" ]]; then
            echo The tags are ${{ inputs.tags }}
          else
            echo "print_tags is false"
          fi
          if [[ "$PRINT_TAGS" == "true" ]]; then
            echo The tags are ${{ inputs.tags }}
          else
            echo "print_tags is false"
          fi
        env:
          PRINT_TAGS: ${{ inputs.print_tags }}
```

{% endraw %}

Never use {% raw %}`if: ${{ inputs.print_tags }} == false`{% endraw %} with `==` outside of {% raw %}`{{}}`{% endraw %}, it will always be true.
{: .notice--warning}

## Passing variables

### Passing data between steps inside a job

#### Passing by $GITHUB_ENV between steps

You can make an environment variable available to any subsequent steps in a workflow job by defining or updating the environment variable and writing this to the [GITHUB_ENV](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-environment-variable) environment file.

```yaml
- run: echo "var_1=value1" >> $GITHUB_ENV
- run: echo "var_1: $var1"
```

#### Passing by $GITHUB_OUTPUT between steps

Sets a step's [output parameter](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter). Note that the step will need an id to be defined to later retrieve the output value

### Passing data between jobs inside a workflow

#### Passing by artifacts between jobs

You can use the [upload-artifact and download-artifact actions](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts#passing-data-between-jobs-in-a-workflow) to share data (in the forms of a file) between jobs in a workflow.

To share variables, you can save the variables in a file with format:

```bash
VAR_1=value1
VAR_2=value2
```

Then download the file from another job and source it to load the variables:

```yaml
- run: |
    sed "" {downloaded_file_path} >> $GITHUB_ENV
  shell: bash
```

#### Passing by $GITHUB_OUTPUT between jobs

<https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idoutputs>

### Passing data between caller workflow and called (reusable) workflow

Use [on.workflow_call.outputs](https://docs.github.com/en/actions/using-workflows/reusing-workflows#using-outputs-from-a-reusable-workflow), called workflow outputs are available to all downstream jobs in the caller workflow.

### Passing data between irrelevant workflows

- <https://github.com/actions/download-artifact/issues/3#issuecomment-580658517>
- <https://github.com/actions/download-artifact/issues/3#issuecomment-1017141067>
- <https://github.com/dawidd6/action-download-artifact>
