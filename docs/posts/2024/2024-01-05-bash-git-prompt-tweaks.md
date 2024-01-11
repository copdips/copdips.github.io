---
authors:
- copdips
categories:
- python
- shell
- git
comments: true
date:
  created: 2024-01-05
description: Some personal tweaks in bash-git-prompt
---

# bash-git-prompt tweaks

Some tweaks I made to [bash-git-prompt](https://github.com/magicmonty/bash-git-prompt). dynamic Python virtualenv path, new var GIT_MESSAGE, etc.

<!-- more -->

## Python venv path within bash git prompt

bash-git-prompt displays the current Python venv folder name within the prompt, among other things. I would like it to display the full path of the current Python venv if the venv is not located in the current folder. This will help prevent me from using the wrong venv when I switch between projects.

To achieve this, I have to modify the `gp_add_virtualenv_to_prompt` function in the `~/.bash-git-prompt/gitprompt.sh` script, as I used the [git clone method](https://github.com/magicmonty/bash-git-prompt#via-git-clone) to install bash-git-prompt.

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

## New var GIT_MESSAGE

bash-git-prompt holds an env var `$GIT_BRANCH` which equals to the current git branch name. For example `feat/#111/add-new-feature`. I want to have a new var `$GIT_MESSAGE` which equals to the commit message based on the current git branch. For example `feat/#111/add new feature`. Because in my `~/.bashrc`, I have an alias `gitpush`:

```bash
alias gitpush='git ci -am "$GIT_MESSAGE" ; git push origin $GIT_BRANCH`
```

So I can just type `gitpush` to commit and push my changes to the remote repo.

To achieve this, I have to add one line right after `GIT_BRANCH` in the `~/.bash-git-prompt/gitprompt.sh` script.

```diff title="add new var GIT_MESSAGE"
  export GIT_BRANCH=$(replaceSymbols "${git_status_fields[@]:0:1}")
+  export GIT_MESSAGE=$( [[ "$GIT_BRANCH" == */* ]] && echo "${GIT_BRANCH%/*}/$(echo ${GIT_BRANCH##*/} | sed 's/-/ /g')" || echo "${GIT_BRANCH//-/ }" )
```

What this line does is:

- If the branch name contains `/`, `-` in the left part of the last `/` in the branch name will be converted to space.
- If the branch name does not contain `/`, all `-` in the branch name will be converted to space.

For example:

- branch name `feat/#111/add-new-feature_a` will be converted to message `feat/#111/add new feature_a`.
- branch name `#111/add-new-feature_a` will be converted to message `#111/add new feature_a`.
- branch name `add-new-feature_a` will be converted to message `add new feature_a`.
