---
authors:
- copdips
categories:
- cicd
- github
- azure
comments: true
date:
  created: 2023-11-18
description: ''
---

# Github actions: deploy static files to azure web app

Although Azure provides already a [GitHub Actions for Azure Web App](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=userlevel) to deploy static files to Azure Web App, but we can also do it ourselves with a azure cli command.

Suppose the static files are generated in a folder named `site`, then the above Azure doc says we can use the following command to deploy it to Azure Web App:

```yaml
# action actions/checkout should be run before this step
- name: Set Web App runtime
  run: |
    az webapp config set \
      --resource-group ${{ inputs.mkdocs-azure-resource-group-name }} \
      --name ${{ inputs.mkdocs-azure-app-name }} \
      --linux-fx-version "STATICSITE|1.0"

- name: Run Azure webapp deploy action using Azure Credentials
  uses: azure/webapps-deploy@v2
  with:
    app-name: ${{ inputs.mkdocs-azure-app-name }}
    package: site
````

!!! note

    We manually set the web app runtime to `STATICSITE|1.0` as users might created the web app with other runtime (`STATICSITE|1.0` is not selectable during the standard Web App resource creation except they chose specifically the [Static Web App](https://devblogs.microsoft.com/devops/comparing-azure-static-web-apps-vs-azure-webapps-vs-azure-blob-storage-static-sites/) resource), as we're pushing static files, we should set the runtime to `STATICSITE|1.0`.

!!! warning

    The [Azure doc](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=userlevel) uses azure/webapps-deploy@`v2` instead of latest azure/webapps-deploy@`v3`, after some tests, `v3` version has some bug on reboot as post deployment step. See [this issue](https://github.com/Azure/webapps-deploy/issues/379) for more details.

The above github action could be replaced with:

```yaml
# action actions/checkout should be run before this step
- name: Run Azure Cli using Azure Credentials
  run: |
    cd site && zip -r ../site.zip * && cd ..

    az webapp config set \
      --resource-group ${{ inputs.mkdocs-azure-resource-group-name }} \
      --name ${{ inputs.mkdocs-azure-app-name }} \
      --linux-fx-version "STATICSITE|1.0"

    az webapp deployment source config-zip \
      --resource-group ${{ inputs.mkdocs-azure-resource-group-name }} \
      --name ${{ inputs.mkdocs-azure-app-name }} \
      --src site.zip
```

!!! note

    When using `az webapp deploy --src-path site.zip --type zip` instead of `az webapp deployment source config-zip`, we get the exact same reboot error as azure/webapps-deploy@`v3`. However `v3` action updates the web app with the new version despite the reboot error, but `az webapp deploy` does not update the web app with the new version.
