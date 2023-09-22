---
last_modified_at:
title: "Github Actions - Python"
excerpt: ""
tags:
  - cicd
  - github
  - python
  - pip
  - auth
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

In March 2023, there was a great new that Azure Service Principal was been [introduced in Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/release-notes/2023/sprint-219-update#service-principal-and-managed-identity-support-in-azure-devops-public-preview), eliminating the use of service account.

1. Create a service principal in Azure Active Directory.
2. Add the service principal to the Azure DevOps Artifacts feed with `Contributor` role. Package publishing needs `Contributor` role, but package installation only needs `Reader` role.
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

    - name: Setup pip
      run: |
        access_token=$(az account get-access-token | jq .accessToken -r)
        echo "PIP_INDEX_URL=https://:$access_token@pkgs.dev.azure.com/{azdo_org_name}/_packaging/{azdo_artifacts_feed_name}/pypi/simple/" >> $GITHUB_ENV

    - name: Install dependencies
      run: |
        pip install -U pip
        pip install -r requirements/requirements.txt
    ```

    {% endraw %}
