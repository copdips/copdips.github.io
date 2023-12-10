---
last_modified_at:
title: "Github Actions - Custom Actions"
excerpt: ""
tags:
  - cicd
  - githubaction
  - azure
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

## Actions checkout location in workflow

{% raw %}
Actions are automatically checked out by Github Action from the beginning of a workflow run, the checkout path could be found by: env var [$GITHUB_ACTION_PATH](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables), github context [${{ github.action_path }}](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context). This is very useful when you need to [reference some files or scripts](https://stackoverflow.com/a/73839061/5095636) saved in the same repository as the actions.

```yaml
{% endraw %}

```bash

Actions in workflow:

```yaml
- name: Check out repository code
  uses: actions/checkout@v4

- name: Use action in the version of the main branch
  uses:{org_name}/{repo_name}/actions/{action_path}@main

- name: Use action in the version of v1
  uses:{org_name}/{repo_name}/actions/{action_path}@v1
```

Actions checkout location:

```bash
../../_actions/actions/checkout
├── v4
│   ├── CHANGELOG.md
│   ├── CODEOWNERS
│   ├── ...

../../_actions/{org_name}/{repo_name}
├── main
│   ├── README.md
│   └── actions
│   └── ...
├── main.completed
├── v1
│   ├── README.md
│   └── actions
│   └── ...
└── v1.completed
```

## Multiple actions in single repository

You can save multiple actions inside a single repository, and use them in the form of [`uses: org/repo/folder_path@git_ref`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-using-a-public-action-in-a-subdirectory) in a workflow.

## azure/CLI

Benefits of using azure/CLI over run task:

1. azure/CLI runs `az` commands in an isolated docker container.
2. azure/CLI can choose the CLI version.
3. For some self-hosted runner, may not have "az cli" pre-installed, the Azure/CLI action eliminates the need for complex installation steps.

Can also set [shared variables inside a job](https://copdips.com/2023/09/github-actions-variables.html#passing-data-between-steps-inside-a-job) to be used outside the azure/CLI step, even it's run inside a docker container.

Drawbacks:

1. slowness: `azure/CLI` is much slower (around 20s to bootstrap on a ubuntu-latest-4core runner) than standard `run` step, because it needs to pull the docker image and run the container.
