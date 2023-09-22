---
last_modified_at:
title: "Github Actions - Environment"
excerpt: ""
tags:
  - cicd
  - githubaction
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

## Dynamic environment

[environment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#using-an-environment) is set at job level (not at step level), so we should use the `$GITHUB_OUTPUT` context to set the environment name dynamically, see [here](https://copdips.com/2023/09/github-actions-variables.html#passing-variables) to learn how to pass data between jobs.

Standard usage for static value is like this:

```yaml
jobs:
  deployment:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: deploy
        # ...deployment-specific steps
```

For advanced usage with dynamic value should be like this:

{% raw %}

```yaml
# call reusable workflow set_target_env.yml to set the target_env
jobs:
  set_target_env:
    uses: ./.github/workflows/set_target_env.yml
  deployment:
    runs-on: ubuntu-latest
    needs: [set_target_env]
    environment:
      name: ${{ needs.set_target_env.outputs.workflow_output_target_env }}
    env:
      TARGET_ENV: ${{ needs.set_target_env.outputs.workflow_output_target_env }}
    steps:
      - run: |
          echo "TARGET_ENV: $TARGET_ENV"
      # ...other deployment-specific steps based on $TARGET_ENV
```

{% endraw %}
