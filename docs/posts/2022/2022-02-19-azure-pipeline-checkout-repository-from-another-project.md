---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-02-19
description: ''
---

# Azure pipeline checkout repository from another project

## Context

This post can be an extend to my previous [post on variables and templates reuse](https://copdips.com/2022/02/azure-pipeline-reuse-variables-in-template-from-another-repository.html)

In fact, in addition to the variables and templates, I also need to reuse some non native Azure pipeline yaml files, for example some Python scripts defined in the shared template. If we use the same technic shown by the previous blog, the pipeline will throw error saying that it cannot find the Python script. This is because we need to checkout the remote repository at first before using the native pipeline yaml files.

<!-- more -->

## Checkout repository from another project

By default, each pipeline run has a temproray token of the [project build service account](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#scoped-build-identities), this account name should be in the format of: `[Project name] Build Service ([Organization name])`, we want to use this token to checkout the remote repository.

We can also use a third account PAT to perform the checkout, but I won't explain here because we need to save the PAT somewhere which is less convenient than the default build service account. We should use the build service account as much as possible.

If we do nothing, just add the `checkout` step in the pipeline as shown [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/multi-repo-checkout?view=azure-devops#repository-resource-definition), the pipeline run will throw the error like below:

  > "remote: TF401019: The Git repository with name or identifier {remote repository name} does not exist or you do not have permissions for the operation you are attempting."

There might be many [reasons](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git?view=azure-devops&tabs=yaml#failing-checkout) that can trigger this error, but for this case, this is because since [May 2020](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#limit-job-authorization-scope-to-referenced-azure-devops-repositories), all the new projects have the option `Limit job authorization scope to current project for non-release pipelines` enabled. Which means by default the built-in build service account of a project A cannot access anything inside the project B. The cross-project access is denied by default.

Disable this option makes the checkout of remote repository worked, but it opens also a very big [security issue](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#job-authorization-scope). So we should **NEVER** disable it.

### Readers group to the whole target project

My first try was going the security tab of the remote repository (projectB's Project Settings -> Repos -> Repositories -> sharedRepo), and grant the `source project build service account` the read permission on it, I got the same error. Then, I granted the same permission at all repositories level, same error. Finally, I added the `source project build service account` into the `Readers group` of the shared project (Project Settings -> Permissions -> Groups -> Readers), and this time, it worked.

!!! warning

    So the whole blog can be summarized to the above phrase by using the `Readers` group. But please be aware that, as it's read-only access to the whole target project, which means the `source project build service account` has the **read access to all the repositories inside the target project**. If you want to grant read access **only to a single repository**, you need to add the `source project build service account` to all the other repositories security tabs and set the **Read permission to Deny**. As said in above first try, the inverse way doesn't work as the time of writing this blog.

### Create read access to the target repository

This method is shown [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git?view=azure-devops&tabs=yaml#failing-checkout) in the last use case, which is:
- If the scope is project? => Yes
- Is the repo in the same project as the pipeline? => No
- Is your pipeline in a public project? => No

You need to take additional steps to grant access. Let us say that your pipeline exists in project A and that your repository exists in project B.
1. Go to the project settings of the project in which the repository exists (B). Select Repos -> Repositories -> specific repository.
2. Add your-project-name Build Service (your-collection-name) to the list of users, where your-project-name is the name of the project in which your pipeline exists (A).
3. Give Read access to the account.
4. (Update 2022-09-16)(refer to this [doc](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#configure-permissions-for-a-project-to-access-another-project-in-the-same-project-collection)) Create a new group in the target project permissions tab. Add the `source project build service account` into this group. Grant this new group with the `View project-level information` permission, or you can also grant this permission only to the added source project build service account.

!!! note

    In fact, the default `Readers` group has also this permission, but it's not straightforward to figure out that we must need this permission in addition to the `Read` permission at the repository level.
