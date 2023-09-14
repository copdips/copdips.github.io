---
last_modified_at:
title: "Github Actions"
excerpt: ""
tags:
  - cicd
  - github
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

## Variables

### Parsing variables

#### Parsing variables with object type

Worklow :

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

#### Parsing variables with boolean type

Check with `if`:

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

Never use {% raw %}`if: ${{ inputs.print_tags }} == false`{% endraw %} with `==` outside of {% raw %}`{{}}`{% endraw %}, it will always be true.
{: .notice--warning}

### Passing variables

#### Passing data between steps inside a job

##### Passing by $GITHUB_ENV between steps

You can make an environment variable available to any subsequent steps in a workflow job by defining or updating the environment variable and writing this to the [GITHUB_ENV](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-environment-variable) environment file.

```yaml
- run: echo "var_1=value1" >> $GITHUB_ENV

- run: echo "var_1: $var1"
```

##### Passing by $GITHUB_OUTPUT between steps

Sets a step's [output parameter](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter). Note that the step will need an id to be defined to later retrieve the output value

#### Passing data between jobs inside a workflow

##### Passing by artifacts between jobs

You can use the [upload-artifact and download-artifact actions](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts) to share data between jobs in a workflow.

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

##### Passing by $GITHUB_OUTPUT between jobs

<https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idoutputs>

##### Passing data between caller workflow and called (reusable) workflow

Use [on.workflow_call.outputs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onworkflow_calloutputs), called workflow outputs are available to all downstream jobs in the caller workflow.

#### Passing data between irrelevant workflows

- <https://github.com/actions/download-artifact/issues/3#issuecomment-580658517>
- <https://github.com/actions/download-artifact/issues/3#issuecomment-1017141067>
- <https://github.com/dawidd6/action-download-artifact>

## Github custom actions

> "[Actions](https://docs.github.com/en/actions/creating-actions/about-custom-actions) are individual tasks that you can combine to create jobs and customize your workflow. You can create your own actions, or use and customize actions shared by the GitHub community."

### Using multiple actions from another single internal repository within the same organization

Normally to use a custom action from another internal repository within the same organization (or enterprise), you can only define one single action per repository and use it as a standard actions without any additional access token as long as the actions repo is inside the same organization (or enterprise). To have multiple actions inside the same repository for whatever reason, you have 2 workarounds, one is to checkout the actions repository with a PAT token and use the actions just like they are defined from the local repository and another workaround is to copy the actions files from _actions folder to the the local repository.

#### Checking out actions repository with PAT token

1. create a Github [fine-grained PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) (not the classic PAT) with `repo` scope to access the actions repository only.
2. add the PAT token as a secret (for e.g. `ACTIONS_REPO_READ_PAT`) at the repository level or organization level if you want to share the actions for the whole organization.
3. use the PAT token to checkout the actions repository in the workflow.

```yaml
- name: Check out main repo
  uses: actions/checkout@v4

# suppose in the action repo {actions_repo_orga_name}/{actions_repo_name},
# you have the action defined in: .github/actions/my_action
- name: Check out actions repo
  uses: actions/checkout@v4
  with:
    repository: {actions_repo_orga_name}/{actions_repo_name}
    # the actions repo willed be checkout to the current main repo's root folder,
    # the path param could have other values to avoid conflict with the current repo,
    # be careful if you need to test and build the current repo,
    # this new actions folder should not be taken into account.
    path: {repo_name}
    token: ${{ secrets.ACTIONS_REPO_READ_PAT }}
    # ref: main  # optional, default is main

# from now on, you have the actions files in local folder {repo_name}/.github/actions
- name: Call my_action
  uses: ./{repo_name}/.github/actions/my_action
```

#### Copying actions files from _actions folder without any PAT token

In a Github actions workflow, when you use a real external actions in the form of:
`uses: {actions_repo_orga_name}/{actions_repo_name}@{actions_repo_git_ref}`

The related actions repo are downloaded automatically with user PAT token from the very beginning of the workflow run to a folder:
`../../_actions/{actions_repo_orga_name}/{actions_repo_name}/{actions_repo_git_ref}/actions/`.

So you can copy the actions files from the `_actions` folder to the `.github/actions` folder in the local repository, then you can use the actions just like they are defined from the local repository.

The `_actions` folder is only partially documented [here](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables) on the `GITHUB_ACTIONS_PATH` default environment variable.

### azure/CLI

Benefits of using azure/CLI over run task:

1. azure/CLI runs `az` commands in a isolated docker container.
2. azure/CLI can choose the CLI version.
3. For some self-hosted runner, may not have "az cli" pre-installed, the Azure/CLI action eliminates the need for complex installation steps.

Can also set [shared variables inside a job](#sharing-data-between-steps-inside-a-job) to be used outside the azure/CLI step, even it's run inside a docker container.

Drawbacks:

1. slowness: `azure/CLI` is much slower (around 20s to bootstrap on a ubuntu-latest-4core runner) than standard `run` step, because it needs to pull the docker image and run the container.
