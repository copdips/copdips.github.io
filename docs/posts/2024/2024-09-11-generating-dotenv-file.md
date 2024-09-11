---
authors:
- copdips
categories:
- python
comments: true
date:
  created: 2024-09-11
---

# Generating .env file

During local testing, we often need to set environment variables. One way to do this is to create a `.env` file in the root directory of the project.
This file contains key-value pairs of environment variables. For example, a `.env` file might look like this:

```plaintext
ENV=dev
SECRET=xxx
```

Hereunder a quick bash script to generate a `.env` file from a list of Azure KeyVault secrets, same logic can be applied to other secret managers.

```bash
#!/bin/bash
set -e

KEY_VAULT_NAME="azure_keyvault_name"

secrets=(
  "secret_name_1"
  "secret_name_2"
  "secret_name_3"
)

az login

# try to get the first secret to check if the user is authenticated before overwriting the .env file
first_secret=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "${secrets[0]}")

> .env
if ! grep -q "^\.env$" .gitignore; then
  echo ".env" >> .gitignore
  echo ".env added to .gitignore"
fi

for secret in "${secrets[@]}"; do
  value=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "$secret" | jq .value -r)
  secret_upper=$(echo "$secret" | tr '[:lower:]-' '[:upper:]_')
  echo "${secret_upper}=${value}" >> .env
done
```
