---
last_modified_at:
title: "Github Actions - Python"
excerpt: ""
tags:
  - cicd
  - githubaction
  - python
  - pip
  - auth
  - azure
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

## Setting up pip authentication

### PIP_INDEX_URL vs PIP_EXTRA_INDEX_URL

In most cases, when setting up private Python package artifacts (like Azure DevOps Artifacts, JFrog Artifactory, etc.) are configured to mirror the public PyPi. In such scenarios, we only need to use `PIP_INDEX_URL` to point to these  private artifacts.

However, some people might use `PIP_INDEX_URL` point to the public PyPi, and `PIP_EXTRA_INDEX_URL` to point to the private artifacts. This approach is not recommended, as it results in the public PyPi searched first, followed by the private artifacts. This poses a security risk where a malicious actor can publish a package with the same name as your private one on the public PyPi.

### Auth for Azure DevOps Artifacts

#### Auth by Azure SPN crendentials

In March 2023, there was a great news that Azure Service Principal was been [introduced in Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/release-notes/2023/sprint-219-update#service-principal-and-managed-identity-support-in-azure-devops-public-preview), eliminating the use of service account.

1. Create a service principal in Azure Active Directory.
2. Add the service principal to the Azure DevOps Artifacts feed with `Contributor` role. Package publishing (twine upload) needs `Contributor` role, but package installation (pip install) only needs `Reader` role.
3. Add SPN credentials to Github Secrets with name `AZURE_CREDENTIALS`, and value in JSON format:

    ```json
    {
      "clientId": "xxxxx",
      "clientSecret": "xxxxx",
      "subscriptionId": "xxxxx",
      "tenantId": "xxxxx"
    }
    ```

4. Create env var `PIP_INDEX_URL` in the workflow, and set it to the Azure DevOps Artifacts feed URL.
    {% raw %}

    ```yaml
    - uses: actions/checkout@v4


    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
        # see below post of a faster Python cache:
        # https://copdips.com/2023/09/github-actions-cache.html#pip-cache-dir-vs-pip-install-dir
        cache: pip
        cache-dependency-path: requirements/*.txt

    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Setup Python package feed
      run: |
        access_token=$(az account get-access-token | jq .accessToken -r)

        # setup pip auth
        echo "PIP_INDEX_URL=https://:$access_token@pkgs.dev.azure.com/{azdo_org_name}/_packaging/{azdo_artifacts_feed_name}/pypi/simple/" >> $GITHUB_ENV

        # setup twine auth
        cat > ~/.pypirc <<EOF
        [distutils]
        index-servers={azdo_artifacts_feed_name}
        [{azdo_artifacts_feed_name}]
        repository=https://pkgs.dev.azure.com/{azdo_org_name}/_packaging/{azdo_artifacts_feed_name}/pypi/upload
        username=build
        password=$access_token
        EOF

        # setup access token for action pypa/gh-action-pypi-publish
        echo "ACCESS_TOKEN=$access_token" >> $GITHUB_ENV

    - name: Install dependencies
      run: |
        pip install -U pip
        pip install -r requirements/requirements.txt

    - name: Build Python package
      run: |
        # need to install wheel in advance
        python setup.py sdist bdist_wheel
        # modern Python uses `python -m build` instead

    # alternative Python package build and check
    - name: Build and Check Package
      uses: hynek/build-and-inspect-python-package@v1.5

    - name: Publish Python package by twine
      run: |
        # need to install twine in advance
        twine upload -r {azdo_artifacts_feed_name} dist/*.whl

    # alternative Python package publish
    - name: Publish Python package by action
      # does not need to install twine in advance
      uses: pypa/gh-action-pypi-publish@release/v1
      with:
        repository-url: "https://pkgs.dev.azure.com/{azdo_org_name}/_packaging/{azdo_artifacts_feed_name}/pypi/upload"
        password: ${{ env.ACCESS_TOKEN }}

    - name: Cleanup secret envs
      run: |
        echo "PIP_INDEX_URL=" >> $GITHUB_ENV
        echo "ACCESS_TOKEN=" >> $GITHUB_ENV
    ```

    {% endraw %}

#### Auth by Azure OpenID Connect (OIDC)

We can also [setup OpenID Connect (OIDC) between Github Action and Azure](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure). It's practical because we do not need to worry about Azure SPN secret rotation. However, a drawback is that when setting up OIDC, we must add a [filter](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-cli%2Clinux#add-federated-credentials) (`subject` field in the `credential.json`). This could be a branch name, tag name, pull request, or environment name, we can not use wildcards in the filter, so we have to set up OIDC for each branch, tag, pull request or environment as needed. This is not very practical. For AWS, there's no such limitation.

To use Azure OIDC with Github Action, we need to add the following to the workflow:
{% raw %}

```yaml
...
permissions:
  id-token: write
  contents: read

jobs:
  a_job:
    ...
    steps:
      - name: Azure login by OIDC
        uses: azure/login@v1
        with:
          # Official doc puts these 3 fields in secrets, but it's not necessary,
          # as `subject` field in the credential.json prevents other repos from
          # using the same credential. And these are not sensitive info neither.
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
          client-id: ${{ vars.AZURE_CLIENT_ID }}
```

{% endraw %}
