---
last_modified_at:
title: "Calling Azure REST API"
excerpt: ""
tags:
  - azure
  - api
  - rest
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

This blog [Calling Azure REST API via curl](https://mauridb.medium.com/calling-azure-rest-api-via-curl-eb10a06127) is pretty good. Just two more things.

## Auth token in curl

We can use `curl -X GET -u :$token` instead of `curl -X GET -H "Authorization: Bearer $token"`

## Azure DevOps API resource id for OAuth

when using `az rest` to call [Azure DevOps API](https://learn.microsoft.com/en-us/rest/api/azure/devops/), you will get a similar error as follows:

> Can't derive appropriate Azure AD resource from --url to acquire an access token. If access token is required, use --resource to specify the resource.

This is because Azure DevOps API base url: [https://dev.azure.com/](https://dev.azure.com/) or [https://vssps.dev.azure.com/](https://vssps.dev.azure.com/), etc. are not an Azure cloud endpoint.

```bash
$ az rest --help
Command
    az rest : Invoke a custom request.
        This command automatically authenticates using the logged-in credential: If Authorization
        header is not set, it attaches header `Authorization: Bearer <token>`, where `<token>` is
        retrieved from AAD. The target resource of the token is derived from --url if --url starts
        with an endpoint from `az cloud show --query endpoints`. You may also use --resource for a
        custom resource.
        If Content-Type header is not set and --body is a valid JSON string, Content-Type header
        will default to application/json.
    Arguments
        [...redacted]
        --resource : Resource url for which CLI should acquire a token from AAD
                     in order to access the service. The token will be placed in
                     the Authorization header. By default, CLI can figure this
                     out based on --url argument, unless you use ones not in the
                     list of "az cloud show --query endpoints".
        [...redacted]
```

```bash
$ az cloud show --query endpoints
{
  "activeDirectory": "https://login.microsoftonline.com",
  "activeDirectoryDataLakeResourceId": "https://datalake.azure.net/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "activeDirectoryResourceId": "https://management.core.windows.net/",
  "appInsightsResourceId": "https://api.applicationinsights.io",
  "appInsightsTelemetryChannelResourceId": "https://dc.applicationinsights.azure.com/v2/track",
  "attestationResourceId": "https://attest.azure.net",
  "azmirrorStorageAccountResourceId": null,
  "batchResourceId": "https://batch.core.windows.net/",
  "gallery": "https://gallery.azure.com/",
  "logAnalyticsResourceId": "https://api.loganalytics.io",
  "management": "https://management.core.windows.net/",
  "mediaResourceId": "https://rest.media.azure.net",
  "microsoftGraphResourceId": "https://graph.microsoft.com/",
  "ossrdbmsResourceId": "https://ossrdbms-aad.database.windows.net",
  "portal": "https://portal.azure.com",
  "resourceManager": "https://management.azure.com/",
  "sqlManagement": "https://management.core.windows.net:8443/",
  "synapseAnalyticsResourceId": "https://dev.azuresynapse.net",
  "vmImageAliasDoc": "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/arm-compute/quickstart-templates/aliases.json"
}
```

So we need to find the resource url for Azure DevOps API. Hopefully, we can find it from this [github issue](https://github.com/Azure/azure-cli/issues/7618#issuecomment-909822540), or from the official [Azure DevOps doc](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/manage-personal-access-tokens-via-api?view=azure-devops#configure-a-quickstart-application), we can use `499b84ac-1321-427f-aa17-267ca6975798` as the value of `--resource` to call `az rest`
