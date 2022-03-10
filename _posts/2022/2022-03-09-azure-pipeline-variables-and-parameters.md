---
last_modified_at:
title: "Azure pipeline variables and parameters"
excerpt: ""
tags:
  - azure
  - cicd
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

## Variables

### Variables Scope

When we set variables [from a script](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch#set-a-job-scoped-variable-from-a-script), the new variable is only available from the next step, not the step where the variable is defined.

```yml
variables:
  sauce: orange
steps:
# Create a variable
- bash: |
    echo "##vso[task.setvariable variable=sauce]crushed tomatoes" # remember to use double quotes
    echo inside of the same step, sauce: $(sauce)

# Use the variable
# "$(sauce)" is replaced by the contents of the `sauce` variable by Azure Pipelines
# before handing the body of the script to the shell.
- bash: |
    echo from the next step, sauce: $(sauce)
```

The result will be:

```bash
inside of the same step, sauce: orange
from the next step, sauce: crushed tomatoes
```

### Json Variable

Pamameter can have object type like dict in Python, but not the case for variable. The workaround is to assign a raw json string to variable, and using tools like jq to handle it during runtime. The json string variable must follow some special format, the double quotes must be escaped, and the whole string must be enclosed by the single quote.

```yml
aJsonVar: '{ \"dev\": \"foo\", \"prd\": \"bar\" }'
```
