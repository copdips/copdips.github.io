---
last_modified_at:
title: "Github Actions - Error handling"
excerpt: ""
tags:
  - cicd
  - github
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

## continue-on-error vs fail-fast

The [doc](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs#handling-failures) explains that `continue-on-error` applies to a [single job](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idcontinue-on-error) or [single step](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepscontinue-on-error) which defines whether a job or step can continue on its error, while `fail-fast` applies to the entire matrix which means if the failure of a job in the matrix can stop other running jobs in the matrix. For example:

- if `fail-fast` is set to `true`, the entire matrix will stop running when one job fails. But if the failed job has `continue-on-error` set to `true`, the matrix will continue running, as the failed job is not considered as a failure.
- if `fail-fast` is set to `false`, all the jobs triggered by the matrix are considered independent, so the failed job will not affect other jobs.

When setting `continue-on-error` at [job level](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idcontinue-on-error) only, and no set at [step level](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepscontinue-on-error), if one of the steps fails, the remaining steps wont be executed, the job will get a red failure badge in the Github Actions UI, but the job status will be considered as success.
{: .notice--info}

## Status check functions

We can also use [status check functions](https://docs.github.com/en/actions/learn-github-actions/expressions#status-check-functions) {% raw %}`if ${{ success() }}, if: ${{ always() }}, if: ${{ cancelled() }}, if: ${{ failure() }}`{% endraw %} to check the previous step (**or job**) status.

In `if` expression, we can skip the double curly brackets {% raw %}`${{}}`{% endraw %}, for example: `if: success()` instead of {% raw %}`if: ${{ success() }}`{% endraw %}
