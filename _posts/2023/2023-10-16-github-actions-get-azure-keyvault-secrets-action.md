---
last_modified_at:
title: "Github Actions - copdips/get-azure-keyvault-secrets-action"
excerpt: ""
tags:
  - cicd
  - githubaction
  - python
  - async
  - azure
  - vault
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

Recently, I began a new project that requires migrating some process from Azure Pipelines to Github Actions. One of the tasks involves retrieving secrets from Azure Key Vault.

In Azure Pipelines, we have an official task called [AzureKeyVault@2](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-key-vault?view=azure-devops) designed for this purpose. However, its official counterpart in Github Actions, [Azure/get-keyvault-secrets@v1](https://github.com/Azure/get-keyvault-secrets), has been deprecated. The recommended alternative is [Azure CLI](https://github.com/Azure/get-keyvault-secrets#deprecation-notice). While Azure CLI is a suitable option, it operates in a bash shell without multithreading. If numerous secrets need to be fetched, this can be time-consuming.

Over the past weekend, I decided to write my own action using Python, leveraging `asyncio`. I avoided any additional third party Python modules like `requests`, `aiohttp`, or `httpx`, so no pip install needed.

As anticipated, the pure Python solution is notably faster than using the Azure CLI, and even surpasses the speed of the Azure Pipelines task `AzureKeyVault@2`. In my tests, it was able to retrieve the all the secrets from an Azure Key Vault within seconds.

The source code is at: [copdips/get-azure-keyvault-secrets-action](https://github.com/copdips/get-azure-keyvault-secrets-action)

And hereunder is the usage:

{% raw %}

```yaml
# in the calling workflow, user should first login to Azure
- uses: Azure/login@v1
  with:
    # creds: ${{secrets.AZURE_CREDENTIALS}} is not recommended due to json secrets security concerns.
    creds: '{"clientId":"${{ secrets.CLIENT_ID }}","clientSecret":"${{ secrets.CLIENT_SECRET }}","subscriptionId":"${{ secrets.SUBSCRIPTION_ID }}","tenantId":"${{ secrets.TENANT_ID }}"}'

- name: Get Azure KeyVault secrets
  id: get-azure-keyvault-secrets
  uses: copdips/get-azure-keyvault-secrets-action@v1
  with:
    keyvault: {your_azure_keyvault_name}

# Suppose there's a secret named client-secret in the Azure Key Vault,
# so an env var named CLIENT_SECRET should be created by the action.
# You won't see the secret value in the workflow log as it's masked by Github automatically.
- name: Use secrets from env var
  run: |
    echo $CLIENT_SECRET
    echo ${{ env.CLIENT_SECRET }}

- name: Use secrets from output
  run: |
    echo $JSON_SECRETS | jq .CLIENT_SECRET -r
  env:
    JSON_SECRETS: ${{ steps.get-azure-keyvault-secrets.outputs.json }}
```

{% endraw %}
