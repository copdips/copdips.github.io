---
authors:
- copdips
categories:
- python
- shell
comments: true
date:
  created: 2024-01-05
description: Better displaying Python venv path within bash git prompt
---

# Python venv path within bash git prompt

I use [bash-git-prompt](https://github.com/magicmonty/bash-git-prompt), which displays the current Python venv folder name within the prompt, among other things. I would like it to display the full path of the current Python venv if the venv is not located in the current folder. This will help prevent me from using the wrong venv when I switch between projects.

To achieve this, I have to modify the `gp_add_virtualenv_to_prompt` function in the `~/.bash-git-prompt/gitprompt.sh` script, as I used the [git clone method](https://github.com/magicmonty/bash-git-prompt#via-git-clone) to install bash-git-prompt.

<!-- more -->

```diff title="if the venv is not .venv inside current folder, display the full path of the venv. Node and Conda venv are not modified as I don't use them."
function gp_add_virtualenv_to_prompt {
  local ACCUMULATED_VENV_PROMPT=""
  local VENV=""
  if [[ -n "${VIRTUAL_ENV-}" && -z "${VIRTUAL_ENV_DISABLE_PROMPT+x}" ]]; then
+    if [[ $VIRTUAL_ENV == "$(pwd)/.venv" ]]; then
+      VENV=$(basename "${VIRTUAL_ENV}")
+    else
+      VENV=$VIRTUAL_ENV
+    fi
    ACCUMULATED_VENV_PROMPT="${ACCUMULATED_VENV_PROMPT}${GIT_PROMPT_VIRTUALENV//_VIRTUALENV_/${VENV}}"
  fi
  if [[ -n "${NODE_VIRTUAL_ENV-}" && -z "${NODE_VIRTUAL_ENV_DISABLE_PROMPT+x}" ]]; then
    VENV=$(basename "${NODE_VIRTUAL_ENV}")
    ACCUMULATED_VENV_PROMPT="${ACCUMULATED_VENV_PROMPT}${GIT_PROMPT_VIRTUALENV//_VIRTUALENV_/${VENV}}"
  fi
  if [[ -n "${CONDA_DEFAULT_ENV-}" ]]; then
    VENV=$(basename "${CONDA_DEFAULT_ENV}")
    ACCUMULATED_VENV_PROMPT="${ACCUMULATED_VENV_PROMPT}${GIT_PROMPT_VIRTUALENV//_VIRTUALENV_/${VENV}}"
  fi
  echo "${ACCUMULATED_VENV_PROMPT}"
}
```
