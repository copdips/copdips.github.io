---
authors:
- copdips
categories:
- azure
- cicd
comments: true
date:
  created: 2022-04-03
description: ''
---

# Azure Pipeline Checkout Multiple Repositories

This post will talk about some Azure pipeline predefined variables' values in a multiple repositories checkout situation. The official doc is [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/multi-repo-checkout?view=azure-devops).

!!! note

    The examples given in this post is using Azure DevOps repositories and Azure pipeline Ubuntu agent.

## Default Pipeline workspace structure

When a pipeline starts, something is created inside the folder defined in the predefined variable [`$(Pipeline.Workspace)`](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml#pipeline-variables-devops-services), this variable has the same value as `$(Agent.BuildDirectory)`, For example, when using the default Azure pipeline Ubuntu agent, the value is `/home/vsts/work/1`.

At the very beginning of a pipeline run, you should the folder constructed like below:

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 12:52 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 12:52 s
drwxr-xr-x 7 vsts root   4096 Apr  3 12:52 ..
```

- Folder `/home/vsts/work/1` for `Pipeline.Workspace`, `Agent.BuildDirectory`.
- Folder `/home/vsts/work/1/a` for `Build.ArtifactStagingDirectory`, `Build.StagingDirectory`.
- Folder `/home/vsts/work/1/b` for `Build.BinariesDirectory`.
- Folder `//home/vsts/work/1s` for `System.DefaultWorkingDirectory` or sometimes for `Build.SourcesDirectory`, `Build.Repository.LocalPath`.
- Folder `/home/vsts/work/1/TestResults` for `Common.TestResultsDirectory`

!!! warning

    The value of `Build.SourcesDirectory`, `Build.Repository.LocalPath` could change [upon checkout policies](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&,tabs=yaml#build-variables-devops-services), so pay attention when using these two variables.

!!! warning

    `System.DefaultWorkingDirectory` is very important too because its value will **never change** in whatever situation, and this is the default working directory when running the script task, we can confirm it by checking the result of the above `pwd` command.

I will show these variables' value within different steps of 5 different pipelines:

1. With self checkout and external repository checkout (most common)
2. Single self checkout with default path
3. Single self checkout with custom path
4. No self checkout but single external checkout with default path
5. No self checkout but single external checkout with custom path
6. No self checkout but multiple external checkout

## With self checkout and external repository checkout

```yml
resources:
  repositories:
    - repository: another_repo
      type: git
      name: AzureDevOpsProjectName/another_repo

steps:
  - checkout: self
    persistCredentials: true  # persists cred to perform some git remote commands like git push --tags
    path: $(Build.Repository.Name)

  - checkout: another_repo
    path: another_repo

  - script: |
      cp "$BUILD_REPOSITORY_LOCALPATH/." "$SYSTEM_DEFAULTWORKINGDIRECTORY" -r
    displayName: Copy $(Build.Repository.Name) content to default workding directroy
```

### Declare repository resources

Suppose the self (primary) repository name is `cicd`, and in the pipeline file, we declare a repository resource to the repository found at `AzureDevOpsProjectName/another_repo`.

```yml
resources:
  repositories:
    - repository: another_repo
      type: git
      name: AzureDevOpsProjectName/another_repo
```

From the very beginning of the pipeline line, the `another_repo` repository and the `self` repository will be automatically checked out at `/home/vsts/work/1/s`

```bash
ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 12:52 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 12:52 s
drwxr-xr-x 7 vsts root   4096 Apr  3 12:52 ..

ls -lart /home/vsts/work/1/s
total 16
drwxr-xr-x 6 vsts docker 4096 Apr  3 12:52 ..
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 cicd
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 another_repo
drwxr-xr-x 4 vsts docker 4096 Apr  3 12:52 .

```

At this point, the following variables having following values:

| Predefined variable name       | Value                         | When                      |
|--------------------------------|-------------------------------|---------------------------|
| Pipeline.Workspace             | /home/vsts/work/1             | Beginning of the pipeline |
| Agent.BuildDirectory           | /home/vsts/work/1             | Beginning of the pipeline |
| Build.ArtifactStagingDirectory | /home/vsts/work/1/a           | Beginning of the pipeline |
| Build.StagingDirectory         | /home/vsts/work/1/a           | Beginning of the pipeline |
| Build.BinariesDirectory        | /home/vsts/work/1/b           | Beginning of the pipeline |
| System.DefaultWorkingDirectory | /home/vsts/work/1/s           | Beginning of the pipeline |
| Build.SourcesDirectory         | /home/vsts/work/1/s           | Beginning of the pipeline |
| Build.Repository.LocalPath     | **/home/vsts/work/1/s/cicd**  | Beginning of the pipeline |
| Common.TestResultsDirectory    | /home/vsts/work/1/TestResults | Beginning of the pipeline |
| PWD                            | /home/vsts/work/1/s           | Beginning of the pipeline |

!!! warning

    We see both the self repository (cicd) and the external repository (another_repo) is saved to `/home/vsts/work/1/s`, this is because during the compiling time, the pipeline found that we will checkout both the repositories, but if there wouldn't have been the checkout out of the external repository, the `/home/vsts/work/1/s` directory will be empty at this step.

### Checkout self to its repository name

```ymal
- checkout: self
  persistCredentials: true
  path: $(Build.Repository.Name)
```

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 28
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 b
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 a
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  1 08:51 ..
drwxr-xr-x 3 vsts docker 4096 Apr  1 08:51 s
drwxr-xr-x 7 vsts docker 4096 Apr  1 08:51 .
drwxr-xr-x 4 vsts docker 4096 Apr  1 08:51 cicd

ls -lart /home/vsts/work/1/s
total 12
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 another_repo
drwxr-xr-x 3 vsts docker 4096 Apr  1 08:51 .
drwxr-xr-x 7 vsts docker 4096 Apr  1 08:51 ..
```

At this point, the following variables having following values:

| Predefined variable name       | Value                         | When                                     |
|--------------------------------|-------------------------------|------------------------------------------|
| Pipeline.Workspace             | /home/vsts/work/1             | After checking out self to its repo name |
| Agent.BuildDirectory           | /home/vsts/work/1             | After checking out self to its repo name |
| Build.ArtifactStagingDirectory | /home/vsts/work/1/a           | After checking out self to its repo name |
| Build.StagingDirectory         | /home/vsts/work/1/a           | After checking out self to its repo name |
| Build.BinariesDirectory        | /home/vsts/work/1/b           | After checking out self to its repo name |
| System.DefaultWorkingDirectory | /home/vsts/work/1/s           | After checking out self to its repo name |
| Build.SourcesDirectory         | /home/vsts/work/1/s           | After checking out self to its repo name |
| Build.Repository.LocalPath     | **/home/vsts/work/1/cicd**    | After checking out self to its repo name |
| Common.TestResultsDirectory    | /home/vsts/work/1/TestResults | After checking out self to its repo name |
| PWD                            | /home/vsts/work/1/s           | After checking out self to its repo name |

### Checkout another repository to its repository name

```bash
- checkout: another_repo
  path: another_repo
```

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 32
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  3 12:52 ..
drwxr-xr-x 4 vsts docker 4096 Apr  3 12:52 cicd
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 s
drwxr-xr-x 8 vsts docker 4096 Apr  3 12:52 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 12:52 another_repo

ls -lart /home/vsts/work/1/s
total 8
drwxr-xr-x 2 vsts docker 4096 Apr  3 12:52 .
drwxr-xr-x 8 vsts docker 4096 Apr  3 12:52 ..
```

!!! warning

    At this point, nothing exists anymore in the `/home/vsts/work/1/s` folder, remember there was the folder `another_repo` in the previous step. The checkout step moved `/home/vsts/work/1/s/another_repo` to `/home/vsts/work/1/another_repo`.

At this point, the following variables having following values:

| Predefined variable name       | Value                         | When                                             |
|--------------------------------|-------------------------------|--------------------------------------------------|
| Pipeline.Workspace             | /home/vsts/work/1             | After checking out another_repo to its repo name |
| Agent.BuildDirectory           | /home/vsts/work/1             | After checking out another_repo to its repo name |
| Build.ArtifactStagingDirectory | /home/vsts/work/1/a           | After checking out another_repo to its repo name |
| Build.StagingDirectory         | /home/vsts/work/1/a           | After checking out another_repo to its repo name |
| Build.BinariesDirectory        | /home/vsts/work/1/b           | After checking out another_repo to its repo name |
| System.DefaultWorkingDirectory | /home/vsts/work/1/s           | After checking out another_repo to its repo name |
| Build.SourcesDirectory         | /home/vsts/work/1/s           | After checking out another_repo to its repo name |
| Build.Repository.LocalPath     | **/home/vsts/work/1/cicd**    | After checking out another_repo to its repo name |
| Common.TestResultsDirectory    | /home/vsts/work/1/TestResults | After checking out another_repo to its repo name |
| PWD                            | /home/vsts/work/1/s           | After checking out another_repo to its repo name |

### Move self to System.DefaultWorkingDirectory

Once we have multi-checkout repositories in a pipeline, the source code of the self (primary) repository won't be saved in `/home/vsts/work/1/s`, where is pointed by the `System.DefaultWorkingDirectory` variable, but `System.DefaultWorkingDirectory` is the default working directory of the script task, we can add `workingDirectory:` parameter to the script task to change the path, but if we have many script tasks, and even they're declared in some shared templates, it would be difficult to change it. So we need to manually move the source repository content back to `/home/vsts/work/1/s`:

```bash
- script: |
    cp "$BUILD_REPOSITORY_LOCALPATH/." "$SYSTEM_DEFAULTWORKINGDIRECTORY" -r
  displayName: Copy $(Build.Repository.Name) content to default workding directroy
```

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 32
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 b
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 a
drwxr-xr-x 2 vsts docker 4096 Apr  1 08:51 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  1 08:51 ..
drwxr-xr-x 4 vsts docker 4096 Apr  1 08:51 cicd
drwxr-xr-x 4 vsts docker 4096 Apr  1 08:51 s
drwxr-xr-x 8 vsts docker 4096 Apr  1 08:51 .
drwxr-xr-x 4 vsts docker 4096 Apr  1 08:51 another_repo

ls -lart /home/vsts/work/1/s
total 20
-rw-r--r-- 1 vsts docker    0 Apr  1 08:51 repo_cicd.md
-rw-r--r-- 1 vsts docker  985 Apr  1 08:51 README.md
drwxr-xr-x 8 vsts docker 4096 Apr  1 08:51 .git
drwxr-xr-x 3 vsts docker 4096 Apr  1 08:51 .azure-pipelines
drwxr-xr-x 4 vsts docker 4096 Apr  1 08:51 .
drwxr-xr-x 8 vsts docker 4096 Apr  1 08:51 ..

ls -lart
total 20
-rw-r--r-- 1 vsts docker    0 Apr  1 08:51 repo_cicd.md
-rw-r--r-- 1 vsts docker  985 Apr  1 08:51 README.md
drwxr-xr-x 8 vsts docker 4096 Apr  1 08:51 .git
drwxr-xr-x 3 vsts docker 4096 Apr  1 08:51 .azure-pipelines
drwxr-xr-x 4 vsts docker 4096 Apr  1 08:51 .
drwxr-xr-x 8 vsts docker 4096 Apr  1 08:51 ..
```

## Single self checkout with default path

```yml
resources:
  repositories:
    - repository: another_repo
      type: git
      name: AzureDevOpsProjectName/another_repo

steps:
  - checkout: self
    persistCredentials: true
```

### Before checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 s
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:14 .
drwxr-xr-x 7 vsts root   4096 Apr  3 21:14 ..

ls -lart /home/vsts/work/1/s
total 8
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:14 ..
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 .
```

| Predefined variable name       | Value               | When            |
|--------------------------------|---------------------|-----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | before checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | before checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | before checkout |

### After checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:14 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  3 21:14 ..
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:14 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 21:14 s

ls -lart /home/vsts/work/1/s
total 20
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:14 ..
-rw-r--r-- 1 vsts docker    0 Apr  3 21:14 repo_cicd.md
-rw-r--r-- 1 vsts docker  985 Apr  3 21:14 README.md
drwxr-xr-x 3 vsts docker 4096 Apr  3 21:14 .azure-pipelines
drwxr-xr-x 4 vsts docker 4096 Apr  3 21:14 .
drwxr-xr-x 8 vsts docker 4096 Apr  3 21:14 .git
```

| Predefined variable name       | Value               | When           |
|--------------------------------|---------------------|----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | after checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | after checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | after checkout |

## Single self checkout with custom path

```yml
resources:
  repositories:
    - repository: another_repo
      type: git
      name: AzureDevOpsProjectName/another_repo

steps:
  - checkout: self
    persistCredentials: true
    path: $(Build.Repository.Name)
```

### Before checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 s
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:10 .
drwxr-xr-x 7 vsts root   4096 Apr  3 21:10 ..

ls -lart /home/vsts/work/1/s
total 8
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:10 ..
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 .
```

| Predefined variable name       | Value               | When            |
|--------------------------------|---------------------|-----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | before checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | before checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | before checkout |

### After checkout

```bash
pwd
/home/vsts/work/1/cicd

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:10 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  3 21:10 ..
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:10 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 21:10 cicd

ls -lart /home/vsts/work/1/s
ls: cannot access '/home/vsts/work/1/s': No such file or directory
```

| Predefined variable name       | Value                  | When           |
|--------------------------------|------------------------|----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/cicd | after checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/cicd | after checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/cicd | after checkout |

## No self checkout but single external checkout with default path

```yml
resources:
  repositories:
    - repository: another_repo
      type: git
      name: AzureDevOpsProjectName/another_repo

steps:
  - checkout: another_repo
```

### Before checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 s
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:25 .
drwxr-xr-x 7 vsts root   4096 Apr  3 21:25 ..

ls -lart /home/vsts/work/1/s
total 8
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:25 ..
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 .
```

| Predefined variable name       | Value               | When            |
|--------------------------------|---------------------|-----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | before checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | before checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | before checkout |

### After checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 21:25 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  3 21:25 ..
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:25 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 21:25 s

ls -lart /home/vsts/work/1/s
total 40
drwxr-xr-x 6 vsts docker 4096 Apr  3 21:25 ..
-rw-r--r-- 1 vsts docker  947 Apr  3 21:25 README.md
drwxr-xr-x 8 vsts docker 4096 Apr  3 21:25 .git
drwxr-xr-x 5 vsts docker 4096 Apr  3 21:25 repo_another_repo
drwxr-xr-x 4 vsts docker 4096 Apr  3 21:25 .
```

| Predefined variable name       | Value               | When           |
|--------------------------------|---------------------|----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | after checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | after checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | after checkout |

## No self checkout but single external checkout with custom path

Please see following pipeline example, we define an external repository called `another_repo`, but we don't checkout the self repository, and we only checkout this external repository.

```yml
resources:
  repositories:
    - repository: another_repo
      type: git
      name: AzureDevOpsProjectName/another_repo

steps:
  - checkout: another_repo
    path: another_repo
```

### Before checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 s
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 20:52 .
drwxr-xr-x 7 vsts root   4096 Apr  3 20:52 ..

ls -lart /home/vsts/work/1/s
total 8
drwxr-xr-x 6 vsts docker 4096 Apr  3 20:52 ..
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 .
```

| Predefined variable name       | Value               | When            |
|--------------------------------|---------------------|-----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | before checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | before checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | before checkout |

### After checkout

```bash
pwd
/home/vsts/work/1/another_repo

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:52 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  3 20:52 ..
drwxr-xr-x 6 vsts docker 4096 Apr  3 20:53 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 20:53 another_repo

ls -lart /home/vsts/work/1/s
ls: cannot access '/home/vsts/work/1/s': No such file or directory
```

| Predefined variable name       | Value                                           | When           |
|--------------------------------|-------------------------------------------------|----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/another_repo | after checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/another_repo | after checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/another_repo | after checkout |

## No self checkout but multiple external checkout

```yml
resources:
  repositories:
    - repository: another_repo1
      type: git
      name: AzureDevOpsProjectName/another_repo1
    - repository: another_repo2
      type: git
      name: AzureDevOpsProjectName/another_repo2

steps:
  - checkout: another_repo1
    path: another_repo1
  - checkout: another_repo2
    path: another_repo2
```

### Before checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 24
drwxr-xr-x 5 vsts docker 4096 Apr  3 20:59 s
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 TestResults
drwxr-xr-x 6 vsts docker 4096 Apr  3 20:59 .
drwxr-xr-x 7 vsts root   4096 Apr  3 20:59 ..

ls -lart /home/vsts/work/1/s
total 20
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 cicd
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 another_repo1
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 another_repo2
drwxr-xr-x 6 vsts docker 4096 Apr  3 20:59 ..
drwxr-xr-x 5 vsts docker 4096 Apr  3 20:59 .
```

| Predefined variable name       | Value               | When            |
|--------------------------------|---------------------|-----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | before checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | before checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | before checkout |

### After checkout

```bash
pwd
/home/vsts/work/1/s

ls -lart /home/vsts/work/1
total 32
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 b
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 a
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 TestResults
drwxr-xr-x 7 vsts root   4096 Apr  3 20:59 ..
drwxr-xr-x 4 vsts docker 4096 Apr  3 20:59 another_repo1
drwxr-xr-x 3 vsts docker 4096 Apr  3 20:59 s
drwxr-xr-x 8 vsts docker 4096 Apr  3 20:59 .
drwxr-xr-x 4 vsts docker 4096 Apr  3 20:59 another_repo2

ls -lart /home/vsts/work/1/s
total 12
drwxr-xr-x 2 vsts docker 4096 Apr  3 20:59 cicd
drwxr-xr-x 3 vsts docker 4096 Apr  3 20:59 .
drwxr-xr-x 8 vsts docker 4096 Apr  3 20:59 ..
```

| Predefined variable name       | Value               | When            |
|--------------------------------|---------------------|-----------------|
| System.DefaultWorkingDirectory | /home/vsts/work/1/s | before checkout |
| Build.SourcesDirectory         | /home/vsts/work/1/s | before checkout |
| Build.Repository.LocalPath     | /home/vsts/work/1/s | before checkout |
