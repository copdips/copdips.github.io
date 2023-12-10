---
last_modified_at:
title: "Azure pipeline System.AccessToken in shared pipeline"
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

# Var $(System.AccessToken)

[System.AccessToken](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml#systemaccesstoken) is a special variable that carries the security token used by the running build. If you check the doc of [job authorization scope](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#job-authorization-scope), you might think the var `$(System.AccessToken)` has by default the access to all the repositories in the same project where hosts the calling Azure pipeline. But unfortunately, it's only partially right.

## Problem

Suppose following situation:

`ProjectA.RepoOne.PipelineOne`: The Azure DevOps repository `RepoOne` in the Azure DevOps project `ProjectA` has a pipeline `PipelineOne`, the `PipelineOne` just gets the `repositoryId` by `repositoryName`, behind the scenes, it calls the [Azure DevOps API](https://docs.microsoft.com/en-us/rest/api/azure/devops/search/repositories/get?view=azure-devops-rest-7.1). We need to provide an access token to call this API, in our case, we use the built-in `$(System.AccessToken)`.

After the test, if we give `RepoOne` as the repository name, the pipeline works well, and returns the repositoryId of the repository `RepoOne`. But if we give another repository name (for e.g. `RepoTwo`), which is in the same project `ProjectA`, you will get an error something like:

```bash
401 Client Error: Unauthorized for url: https://almsearch.dev.azure.com/...
```

## Root cause

This is because although the `$(System.AccessToken)` is designed to have access to all the repositories in the same project, there's still another level of security control which blocks the API call, which is the pipeline level permission.

## Solution

To fix this, one of the solutions is to add the target repository as [repositories resource](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/resources?view=azure-devops&tabs=schema#define-a-repositories-resource) in the `PipelineOne` yaml file:

```yaml
resources:
  repositories:
    - repository: RepoTwo
      type: git
      name: ProjectA/RepoTwo
```

When we re-run `PipelineOne`, this time the pipeline will be in pending for asking for the permission to access to the `RepoTwo` repository, we need to `manually` click on the `permit` button to grant this access, and then the pipeline will succeed as expected.

The repositories resource **does not accept variables** in the `repository` and `name` values which makes the pipeline authoring a little bit sticky. We must write letter by letter the project name and repository name in string, so we need to declare as many repositories resources as the repositories in the same project on which we want to apply the `PipelineOne`.
{: .notice--info}
