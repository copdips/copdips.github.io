---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-12-30
description: ''
draft: true
---

# Azure pipeline expressions

<!-- more -->

```yaml
# https://docs.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops
# The difference between runtime and compile time expression syntaxes is primarily what context is available. In a compile-time expression (${{ <expression> }}), you have access to parameters and statically defined variables. In a runtime expression ($[ <expression> ]), you have access to more variables but no parameters.

variables:
  staticVar: 'my value' # static variable
  compileVar: ${{ variables.staticVar }} # compile time expression
  isMain: $[eq(variables['Build.SourceBranch'], 'refs/heads/main')] # runtime expression

steps:
  - script: |
      echo ${{variables.staticVar}} # outputs my value
      echo $(compileVar) # outputs my value
      echo $(isMain) # outputs True
```
