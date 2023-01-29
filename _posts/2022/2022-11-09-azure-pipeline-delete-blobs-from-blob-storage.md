---
last_modified_at:
title: "Azure pipeline delete blobs from blob storage"
excerpt: ""
tags:
  - azure
  - cicd
  - storage
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

The example given by this post is **for Azure Pipeline with the latest Ubuntu agent**, for AzCli from local machine, removing the `--auth-mode login` part should work.

As it's a Linux pipeline agent, the pipeline task [AzureFileCopy](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-file-copy?view=azure-devops) can not be used, it's written in Powershell, we should use the [AzureCLI](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-cli?view=azure-devops) task instead.

## Working example

Suppose we have following use case:

|             type             |                value                |
| ---------------------------- | ----------------------------------- |
| storage account name         | sto                                 |
| container name               | con                                 |
| blob 1 path in blob storage  | folder/sub_folder/blob1             |
| blob 2 path in blob storage  | folder/sub_folder/blob2             |
| blob 1 path in local machine | local_folder/local_sub_folder/blob1 |
| blob 2 path in local machine | local_folder/local_sub_folder/blob2 |

The virtual folder `folder/sub_folder/` has only 2 blobs as shown in the above table.

Hereunder the Azure Pipeline code to delete existing files from `folder/sub_folder/` in the Azure blob storage and than upload all the local files from `local_folder/local_sub_folder/` to `folder/sub_folder/`:

```yaml
- task: AzureCLI@2
  displayName: Az File Copy to Storage
  inputs:
    azureSubscription: $(serviceConnection)
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      az config set extension.use_dynamic_install=yes_without_prompt
      folder_path="folder/sub_folder"

      echo "##[command]Getting existing_files"
      existing_files=$(az storage fs file list \
        --auth-mode login \
        -f con \
        --account-name sto \
        --path $folder_path | jq)
      echo -e "existing_files:\n$existing_files"

      echo "##[command]Stating delete"
      echo $existing_files | jq .[].name -r | while read file ; do \
        az storage blob delete \
        --auth-mode login \
        -c con \
        --account-name sto \
        -n "$file" ; \
        done

      echo "##[command]Starting update-batch"
      az storage blob upload-batch \
        --auth-mode login \
        --destination con \
        --account-name sto \
        --destination-path $folder_path \
        --source "local_folder/local_sub_folder"

      echo "##[command]Listing files after upload"
      az storage fs file list \
        --auth-mode login \
        -f con \
        --account-name sto \
        --path $folder_path
```

Should not use `failOnStandardError: true` with `AzureCLI` as the commands `az config set` and `az storage blob upload-batch` send both messages to stderr.
{: .notice--warning}

## Failed with `az storage azcopy blob delete`

The best way to delete bunch of blobs is `az storage azcopy blob delete -c con --account-name sto -t folder/subfolder --recursive`. But if you use `--account-key` for auth, it's currently not available as `az storage account keys list --account-name sto` with current version (v2.41.0) of azure-cli delivered by Azure Pipeline agent has a bug like this: *AttributeError: module 'azure.mgmt.storage.v2022_05_01.models' has no attribute 'ActiveDirectoryPropertiesAccountType'* or this: *AttributeError: module 'azure.mgmt.storage.v2022_05_01.models' has no attribute 'ListKeyExpand'*. So we should use other auth methods like SAS token or connection string pre-populated in KeyVault.

Downgrading the azure-cli version inside [AzureCLI](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-cli?view=azure-devops) during Azure pipeline might work, but not tested.

`az storage azcopy blob delete --account-key` works from local machine if it's not the buggy version installed.
{: .notice--info}

## Failed with `az storage blob delete-batch`

`az storage blob delete-batch -s con --account-name sto --delete-snapshots include --dryrun --pattern "folder/subfolder/*` could work only in case there're not many blobs inside the container `con`, otherwise this command using `--pattern` (with [Python fnmatch](https://docs.python.org/3.7/library/fnmatch.html) behind the scenes) will pending for a long time.
