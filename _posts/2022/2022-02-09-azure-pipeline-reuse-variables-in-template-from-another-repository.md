---
last_modified_at:
title: "Azure pipeline reuse variables in template from another repository"
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

## Context

In my project, I have several Azure pipelines that share some same variables, instead of declaring them in each pipeline, I would like to refactor it by using some central places to store the shared variables.

I can split the variables into 3 groups:

1. organization level variables:
   organization name, tenant id, etc.
2. project level variables:
   project name, resouces group name, keyvault name, project support email, etc.
3. repository level variables:
   module name, repository support email, etc.

Suppose I'm writing an Azure pipeline called `cicd.yml` for the `repositoryA` located at: `organizationA/projectA/repositoryA`, I will save the above 3 groups of variables to 3 places:

1. organization level variables -> to a new repository outside of the project, for e.g. `organizationA/sharedProject/sharedRepository`
2. project level variables -> to a new repository inside the same project, for e.g. `organizationA/projectA/sharedRepository`
3. repository level variables -> to the same repository: `organizationA/projectA/repositoryA`

By checking following two official docs (in fact in the same doc :-)) : [Variable reuse](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops#variable-reuse), [Use other repositories](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops#use-other-repositories), the file content of each variable group could be:

## organization level variables

```yml
# file: organizationA/sharedProject/sharedRepository/.azure-pipelines/variables/organization_variables.yml

variables:
  organizationName: xxx
```

## project level variables

```yml
# file: organizationA/projectA/sharedRepository/.azure-pipelines/variables/project_variables.yml

variables:
  - template: .azure-pipelines/variables/organization_variables.yml@sharedProject_sharedRepository
  - name: myProjectVar
    value: $(organizationName)_abc
```

## repository level variables

```yml
# file: organizationA/projectA/repositoryA/.azure-pipelines/variables/repository_variables.yml

variables:
  - template: .azure-pipelines/variables/project_variables.yml@projectA_sharedRepository
  - name: myRepositoryVar
    value: $(myProjectVar)_abc
```

## root cicd file

```yml
# file: organizationA/projectA/repositoryA/.azure-pipelines/cicd.yml

# repository type = git means Azure DevOps repository as per https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/multi-repo-checkout?view=azure-devops#specify-multiple-repositories

resources:
  repositories:
    - repository: sharedProject_sharedRepository
      type: git
      name: sharedProject/sharedRepository
    - repository: projectA_sharedRepository
      type: git
      name: projectA/sharedRepository

trigger: xxx

variables:
  - template: variables/repository_variables.yml
  - name: myRepositoryVar
    value: xxx

pool:
  vmImage: xxx

steps:
  - script: |
      echo $(myRepositoryVar)
    displayName: test repositry level variables
```

Note: We cannot put the `resources` part elsewhere, it must be declared in the [root pipeline file](https://developercommunity.visualstudio.com/t/unexpected-value-resources-in-yaml-template/728151#TPIN-N782729). Otherwise, the pipeline might throw the `Unexpected value 'resources'` error. There's some black magic that the variables templates defined in other repositories (for e.g. `project_variables.yml`) recognize well the `sharedProject_sharedRepository` repository resource defined in the repository hosting the `cicd.yml` file.
{: .notice--info}
