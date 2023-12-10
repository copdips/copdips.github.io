---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-08-14
description: ''
---

# Azure pipeline jobs

## Traditional jobs vs deployment jobs

- [traditional jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/phases?view=azure-devops&tabs=yaml) run in parallel,
- [deployment jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs?view=azure-devops) run in sequence, save the deployment history to a environment and a resource, and can also be applied with deployment strategy (runOnce, rolling, and the canary)

## Deployment jobs

### Tracking deployment history

As per example given [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs?view=azure-devops#runonce-deployment-strategy-1): we can use `RunOnce deployment strategy` to create some  environments with empty resources and use that as an abstract shell to record deployment history, as the deployment history is across pipelines, down to a specific resource and status of the deployments for auditing.

### Sharing output variables

The syntax is [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs?view=azure-devops#support-for-output-variables).

Be careful that we must provide the `<lifecycle-hookname>` in the `outputs` part. In the below example we can see that the deployement `A` is specified twice: `$[ dependencies.A.outputs['A.setvarStep.myOutputVar'] ]`

```yaml
# Set an output variable in a lifecycle hook of a deployment job executing runOnce strategy.
- deployment: A
  pool:
    vmImage: 'ubuntu-latest'
  environment: staging
  strategy:
    runOnce:
      deploy:
        steps:
        - bash: echo "##vso[task.setvariable variable=myOutputVar;isOutput=true]this is the deployment variable value"
          name: setvarStep
        - bash: echo $(setvarStep.myOutputVar)
          name: echovar

# Map the variable from the job.
- job: B
  dependsOn: A
  pool:
    vmImage: 'ubuntu-latest'
  variables:
    myVarFromDeploymentJob: $[ dependencies.A.outputs['A.setvarStep.myOutputVar'] ]
  steps:
  - script: "echo $(myVarFromDeploymentJob)"
    name: echovar
```

When you output a variable from a deployment job, referencing it from the next job uses different syntax depending on if you want to set a variable or use it as a condition for the stage.

```yaml
stages:
- stage: StageA
  jobs:
  - job: A1
    steps:
      - pwsh: echo "##vso[task.setvariable variable=RunStageB;isOutput=true]true"
        name: setvarStep
      - bash: echo $(System.JobName)

- stage: StageB
  dependsOn:
    - StageA

  # when used in a condition, job name `A1` is included in variable path.
  condition: eq(dependencies.StageA.outputs['A1.setvarStep.RunStageB'], 'true')

  # when use to set a variable, jon name `A1` is not included in the variable path.
  variables:
    myOutputVar: $[stageDependencies.StageA.A1.outputs['setvarStep.RunStageB']]
  jobs:
  - deployment: B1
    pool:
      vmImage: 'ubuntu-latest'
    environment: envB
    strategy:
      runOnce:
        deploy:
          steps:
          - bash: echo $(myOutputVar)
```

!!! note

    Here is the doc for [defining variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops).

