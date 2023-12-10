---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-07-03
description: ''
---

# Azure pipeline conditions

Azure pipeline has two kinds of conditions:

1. With keyword [`condition`](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/conditions?view=azure-devops&tabs=yaml)
2. With jinja like format [`${{if elseif else}}`](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops#conditional-insertion)

In both syntax, we have use parameters and variables, but there's a big difference between them which makes DevOps frustrated.

## Conditions with keyword ${{if elseif else}}

With `${{if elseif else}}` condition, the using parameters and variables' values are calculated during the `compilation/parsing/loading time`, which means:

- Even if you define a variable before the `${{if elseif else}}` block, but the condition is always evaluated to `false` if you use this variable in the condition, as it considers the value doesn't exist yet during the compilation, so if you have a `- ${{ else }}` block, it will always be executed.
- In a `template`, unless the parameters' values can be calculated from the loading time, otherwise they're always evaluated to its default value, if the default value is not defined, Azure pipeline will not raise any error, the condition check just returns `always false`, so the pipeline will never run into it except for the `- ${{ else }}` block.
- But in a `root pipeline` out of template, it's the [real parameter value](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script#use-parameters-to-determine-what-steps-run) being evaluated in the `${{if elseif else}}` block.
- Some predefined variables cannot be used in `${{if elseif else}}` neither, check the column `Available in templates?` in the [Use predefined variables doc](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml), which means these values are always evaluated to `null`.
- When evaluated to `false`, the tasks, scripts, etc. wont even be shown as skipped in the Azure pipelines UI, they're just `not shown`.
- The official doc calls the parameters as [runtime parameters](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script), but in fact they're runtime only when they're not in a template.

## Conditions with keyword condition

The [official doc](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/conditions?view=azure-devops&tabs=yaml) puts the `condition` keyword format in the `Jobs and stages` level, but in fact, we can also use it in `tasks` or `scripts` level.

- Same as to `${{if elseif else}}` condition, if you use `parameters` in `condition` keyword conditions, it's value is calculated in the compilation time, so be careful with their usages.
- `Variables` in the conditions are evaluated `in real time`, this is the only point that make DevOps happy.
- If you really want to evaluate `in real time the parameters`, the workaround is to add a script task in advance that [define some variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash) taking the values of parameters, and then use these variables in the conditions with `condition` keyword.
- When evaluated to `false`, the tasks, scripts, etc. bound by the conditions will be `shown as skipped` in the Azure pipelines UI.
- As `condition` keyword is bound to a single task, script, jobs, stages, etc., if you want to for example run 3 tasks under the same condition, you need to add the same condition to the 3 tasks respectively, whereas with `${{if elseif else}}`, we can group the 3 tasks under the same condition, but as explained above, the values of compared parameters or variables referenced in the `${{if elseif else}}` format conditions are evaluated during the compilation/loading time, so `${{if elseif else}}` will not work for all the use cases, this is the biggest pity of Azure Pipeline from my point of view.
- We can add `condition` to `jobs`, and inside the jobs, we can have multiple tasks, this could be a workaround of above pity if we do not want add condition to each task with the same condition.

## A table to sum up

| Inputs \ Conditions | ${{if elseif else}} keyword      | condition keyword                                |
| ------------------- | -------------------------------- | ------------------------------------------------ |
| parameter           | compilation/parsing/loading time | compilation/parsing/loading time                 |
| variable            | compilation/parsing/loading time | real time (except for some predefined variables) |
