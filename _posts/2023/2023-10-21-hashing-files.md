---
last_modified_at:
title: "Hashing files"
excerpt: ""
tags:
  - cicd
  - githubaction
  - azure
  - shell
  - cache
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

During CI/CD processes, and particularly during CI, we frequently hash dependency files to create cache keys (referred to as `key` input in Github Action [actions/cache](https://github.com/actions/cache) and `key` parameter in Azure pipelines [Cache@2 task](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/cache-v2?view=azure-pipelines)). However, the default hash functions come with certain limitations like [this comment](https://github.com/orgs/community/discussions/25761#discussioncomment-6508758). To address this, we can use the following pure Bash shell command to manually generate the hash value.

For Github Actions, we can use following snippet:

{% raw %}

```yaml
# github actions example
inputs:
  req-files:
    description: >
      requirements files separated by comma or space, glob pattern is allowed.
      e.g. "requirements/*.txt, requirements.txt"
    required: true
runs:
  using: "composite"
  steps:
    - name: Compute hash key
      shell: bash
      env:
        REQ_FILES: ${{ inputs.req-files }}
      run: |
        files=$(echo "$REQ_FILES" | tr "," " " | while read pattern ; do ls $pattern; done)
        files_sep_by_space=""
        for file in $files; do
            files_sep_by_space="$files_sep_by_space $(ls $file | tr '\n' ' ')"
        done
        files_sep_by_space=$(echo $files_sep_by_space | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
        files_hash=$(cat $files_sep_by_space | md5sum | awk '{print $1}')
        echo "files_hash: $files_hash"
```

{% endraw %}

For Azure pipelines, the process is nearly identical to the above Github Action example. The only difference is that we first need to convert the  `reqFiles` parameter from an object to a string. But if you set the parameter type to `string` (as in the Github Action), the process becomes identical.

{% raw %}

```yaml
# azure pipelines example
parameters:
  - name: reqFiles
    displayName: >
      requirements files, glob pattern is allowed.
      e.g.:
      - requirements/*.txt
      - requirements.txt
    type: object
  steps:
    - script: |
        req_files_pattern_string=$(echo "$REQ_FILES_JSON" | jq  '. | join(",")' -r)
        files=$(echo $req_files_pattern_string | tr "," " " | while read pattern ; do ls $pattern; done)
        files_sep_by_space=""
        for file in $files; do
            files_sep_by_space="$files_sep_by_space $(ls $file | tr '\n' ' ')"
        done
        files_sep_by_space=$(echo $files_sep_by_space | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
        files_hash=$(cat $files_sep_by_space | md5sum | awk '{print $1}')
        echo "files_hash: $files_hash"
      displayName: Compute hash key
      env:
        REQ_FILES_JSON: "${{ convertToJson(parameters.reqFiles) }}"
```

{% endraw %}

When creating the cache key, we also need to include os version, the one provided by Github action and Azure pipelines environment vars are not precise enough, they do not give patch version number. We can generate the **full os version** by the following command {%raw%}`cat /etc/os-release | grep -i "version=" | cut -c9- | tr -d '"' | tr ' ' '_'`{%endraw%}
{: .notice--info}
