---
last_modified_at:
title: "Github Actions - Workflows"
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

## Reusable workflows

### Re-run a reusable workflow

[If reusable workflow is not referenced by SHA](https://docs.github.com/en/actions/managing-workflow-runs/re-running-workflows-and-jobs#re-running-workflows-and-jobs-with-reusable-workflows), for example a branch name, when re-run a workflow, it will not use the latest version of the workflow in that branch, but the same commit SHA of the first attempt. Which means, if you use the git amend push to overwrite the old commit history, the workflow re-run will fail as it cannot find the specific SHA version of the workflow.

In contrary, if an action is referenced by branch name, it will always use the latest version of the action in that branch upon re-run.

## Cancelling a workflow

To cancel the current workflow run inside the run itself:

```yaml
- name: cancelling
  uses: andymckay/cancel-action@0.3
```

We can use `if: cancelled()` or `if: always()` to bypass the workflow cancel signal.
