---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-01-22
description: ''
---

# Azure pipeline predefined variables

The [official doc](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables) gives an explanation of all the predefined variables, but it lacks of some concrete examples. Hereunder some examples for my preferred variables.

<!-- more -->

## Access the predefined variables

To access the variables value in YAML pipeline, we can use 2 methods:

1. `$(System.PullRequest.SourceBranch)` : the standard way to access pipeline variables.
2. `$SYSTEM_PULLREQUEST_SOURCEBRANCH` : most of the pipeline variables are mapped to the pipeline machine environment variables in upper snake case.

## Variables upon Git events

Suppose we create a new branch named `new_branch`, and create a pull request (with id `123`) from the new branch `new_branch` to the `main` branch.
During the pipeline, we can see following predefined variables in different GIT events.

!!! note

    Check [here](https://copdips.com/2023/09/github-actions-variables.html#variables-upon-git-events) for variables upon git events in Github Actions.

|    variable name \ git action     |          on push          |                 on pull request                  |                                                                              on merge                                                                               |     on manual trigger     |
| --------------------------------- | ------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Build.SourceBranch                | refs/heads/new_branch     | refs/pull/123/merge                              | refs/heads/main                                                                                                                                                     | refs/heads/new_branch     |
| Build.SourceBranchName            | new_branch                | merge                                            | main                                                                                                                                                                | new_branch                |
| Build.SourceVersionMessage        | {the last commit message} | Merge pull request 123 from new_branch into main | Merged PR 123: {pull request title}<br>**- It's a way to determin this merge is from which PR**<br>**- We can also change the default message when merging the PR** | {the last commit message} |
| Build.Reason                      | IndividualCI              | PullRequest                                      | IndividualCI                                                                                                                                                        | Manual                    |
| System.Pullrequest.SourceBranch   | VAR_NOT_EXISTS            | refs/heads/new_branch                            | VAR_NOT_EXISTS                                                                                                                                                      | VAR_NOT_EXISTS            |
| System.Pullrequest.TargetBranch   | VAR_NOT_EXISTS            | refs/heads/main                                  | VAR_NOT_EXISTS                                                                                                                                                      | VAR_NOT_EXISTS            |
| System.Pullrequest.PullRequestId  | VAR_NOT_EXISTS            | 123                                              | VAR_NOT_EXISTS                                                                                                                                                      | VAR_NOT_EXISTS            |
| System.PullRequest.SourceCommitId | VAR_NOT_EXISTS            | the last commit number in pull request           | VAR_NOT_EXISTS                                                                                                                                                      | VAR_NOT_EXISTS            |

## Variables not varying upon triggering Git action

### System.AccessToken

[System.AccessToken](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml#systemaccesstoken) is a [SecretVariable](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch#secret-variables), which is in fact a PAT token with limited 1 hour of lifetime by default, and is about to be expired [5 minutes before the end of the lifetime](https://github.com/Azure/azure-sdk-for-net/blob/4162f6fa2445b2127468b9cfd080f01c9da88eba/sdk/mgmtcommon/AppAuthentication/Azure.Services.AppAuthentication/AppAuthenticationResult.cs#L41-L45).

- **User name**
  The access token is bound to a build service account, which name should be in this format: `{projectName} Build Service ({organizationName})`. So it's required to set necessary permissions on this account. For example, to be able to publish a Python wheel package to Azure Artifacts, it needs the `AddPackage` permission, we can set the build service account as a contributor to the corresponding Artifacts feed's permission tab to get this permission.
- **Basic auth**
  If we need to use this PAT to create the base64 string, the user name for this PAT should be kept empty, which is in the format of `:$(System.AccessToken)`, to [convert it to base64](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page#use-a-pat), use: `printf "%s"":$(System.AccessToken)" | base64`, or `echo -n ":$(System.AccessToken)" | base64` with `-n`. When using with curl, it should be something like `curl -u :$(System.AccessToken)`, the user name part is empty. or user an basic auth header like `{"Authorization": "Basic {:$(System.AccessToken) in base64 format}"}`.
- **OAtuh**
  Besides the above basic auth (it's secure as the password is a PAT with limited lifetime, not a real clear password), we can also use  OAuth, with header `{"Authorization": "Bearer $(System.AccessToken)"}`, it's not enabled by defaut, we should enable the OAuth by checking the box `Allow scripts to access OAuth token` from `Realeses / Tasks / Agent job (Run on Agent)` or from `Pipelines / Tasks / Agent job (Run on Agent)`. And we need to create a task in advance in order to see the `Tasks` menu. If we don't enbale the option, and use Bearer header directly, we will get an API resposne code `203`, with the reason `Non-Authoritative Information`.
- See also [**job access token**](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml).

### Agent.OS

[Agent.OS](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml#agent-variables-devops-services): Just to check which OS running the pipeline.

## Variables to be set by user

### System.Debug

Add a new variable with the name [System.Debug](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml#systemdebug) and value `true` for debugging.
