---
last_modified_at:
title: "Manage Azure Databricks Service Principal"
excerpt: ""
tags:
  - azure
  - databricks
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


Most of Databricks management can be done from the GUI or [CLI](https://docs.databricks.com/dev-tools/cli/index.html), but for Azure Service Principal, we can only manage it by the [SCIM API](https://docs.databricks.com/dev-tools/api/latest/scim/scim-sp.html). There's an [open PR](https://github.com/databricks/databricks-cli/pull/311) for adding support of SCIM API in Databricks CLI, but the lastest update is back to the beginning of 2021.

This post is to add some tips that not covered by the official API docs.

## Patch Service Principal

The official docs gives op `add`, `remove`, in fact, if you want to for example, update the `displayName` field of a SP, the op should be `add`:

```json
{
    "schemas": [
        "urn:ietf:params:scim:api:messages:2.0:PatchOp"
    ],
    "Operations": [
        {
            "op": "add",
            "path": "displayName",
            "value": "{newServicePrincipalName}"
        }
    ]
}
```

## Consistant fields across workspaces

We could link multiple Databricks workspaces together. Below screenshot is an example of 3 linked workspaces.

![azure-databricks-multiple-workspaces](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2022-03-27-manage-azure-databricks-service-principal/azure-databricks-multiple-workspaces.png)

Please be aware that **each workspace has its own API url**.

Let's see the example of the output of the GET Service Principal endpoint, where the applicationId is `11111111-0000-0000-0000-111111111111`:

```json
{
  "displayName": "foo",
  "externalId": "22222222-0000-0000-0000-222222222222",
  "groups": [
    {
      "display": "group1",
      "type": "direct",
      "value": "111",
      "$ref": "Groups/111"
    },
    {
      "display": "group2",
      "type": "indirect",
      "value": "222",
      "$ref": "Groups/222"
    }
  ],
  "id": "123456789",
  "entitlements": [
    {
      "value": "allow-cluster-create"
    },
    {
      "value": "allow-instance-pool-create"
    },
    {
      "value": "workspace-access"
    }
  ],
  "applicationId": "11111111-0000-0000-0000-111111111111",
  "active": true
}
```

Although we have 3 different workspaces, the same Service Principal (applicationId) defined in these workspace shares some fields:

- displayName
- id
- applicationId

And among these 3 fields, you can only update the `displayName` field, the `id` and `applicationId` fileds are immutable. Which means if we change the `displayName` in one of the workspaces by using the PATCH SCIM API, we will get the the updated `displayName` in other workspaces by using the GET SCIM API. We [can not change](https://docs.databricks.com/dev-tools/api/latest/scim/scim-sp.html#update-service-principal-by-id-patch) `id` and `applicationId` fields, and both of them are the same across workspaces.
