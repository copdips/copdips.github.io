---
authors:
- copdips
categories:
- python
- async
- azure
- auth
- certificate
- web
- api
comments: true
date:
  created: 2024-11-14
---

# Generating Azure OAuth2 Access Token By Python

There are two modern ways to generate an Azure OAuth2 access token using Python: one is by using the [MSAL library](https://learn.microsoft.com/en-us/entra/msal/python/), and the other is by using the [Azure Identity library](https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python), which is [based on the former](https://github.com/AzureAD/microsoft-authentication-library-for-python/issues/299#issuecomment-768777645).

There're also other ways to get the token, like using the `requests` or `aiohttp` libraries etc. to send a POST request to the Azure OAuth2 token endpoint, but it's not recommended. As the MSAL and Azure Identity libraries are the official libraries provided by Microsoft, they are more secure and easier to use. For e.g. they handle token caching, token refreshing, and token expiration automatically. Furthermore, some of the credential types are difficult (too many code) to be implemented by raw `requests` or `aiohttp`.

<!-- more -->

## Azure OAuth2 and OpenID Connect (OIDC)

A quick summary of all the Azure OAuth2 and OpenID Connect (OIDC) flows:

- [OAuth 2 Application types](https://learn.microsoft.com/en-us/entra/identity-platform/v2-app-types)
- [OAuth 2 and OpenID Connect (OIDC) Token grants flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Microsoft identity platform app types and authentication flows](https://learn.microsoft.com/en-us/entra/identity-platform/authentication-flows-app-scenarios)

## MSAL library

- [ClientSecretCredential flow example](https://github.com/AzureAD/microsoft-authentication-library-for-python/blob/dev/sample/confidential_client_sample.py)
- Check the [sample folder](https://github.com/AzureAD/microsoft-authentication-library-for-python/blob/dev/s) for the other flows

!!! warning "MSAL library does not support async"
    Check this [GitHub issue](https://github.com/AzureAD/microsoft-authentication-library-for-python/issues/88) for more information.

    [Azure Identity library](#azure-identity-library) is built on top of the MSAL library and supports async.

## Azure Identity library

- [ClientSecretCredential flow example](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.clientsecretcredential?view=azure-python#examples)
- [Async ClientSecretCredential flow example](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.aio.clientsecretcredential?view=azure-python#examples)
- [Async DefaultAzureCredential flow example](https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python#async-credentials)
- All the available credential types:
    - [non io](https://github.com/Azure/azure-sdk-for-python/blob/main/sdk/identity/azure-identity/azure/identity/__init__.py)
    - [aio](https://github.com/Azure/azure-sdk-for-python/blob/main/sdk/identity/azure-identity/azure/identity/aio/__init__.py)
- Check the [sample folder](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/identity/azure-identity/samples) for examples of some other flows (but not all of them).
