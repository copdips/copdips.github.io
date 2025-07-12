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
  updated: 2025-07-12
description: Some personal tweaks in bash-git-prompt
---

# bash-git-prompt tweaks

Some tweaks I made to [bash-git-prompt](https://github.com/magicmonty/bash-git-prompt). dynamic Python virtualenv path, new var GIT_MESSAGE, etc.

<!-- more -->

## Python venv path within bash-git-prompt

bash-git-prompt displays the current Python venv folder name within the prompt, among other things. I would like it to display the full path of the current Python venv if the venv is not located in the current folder. This will help prevent me from using the wrong venv when I switch between projects.

To achieve this, add following code into `function gp_add_virtualenv_to_prompt` in `~/.bash-git-prompt/gitprompt.sh` to add Python virtual environment name and version to the prompt.

```diff title="bash_git_prompt_venv.patch" hl_lines="5"
diff --git a/gitprompt.sh b/gitprompt.sh
index 978cae7..0f33e0e 100755
--- a/gitprompt.sh
+++ b/gitprompt.sh
@@ -649,7 +649,11 @@ function gp_add_virtualenv_to_prompt {
   local ACCUMULATED_VENV_PROMPT=""
   local VENV=""
   if [[ -n "${VIRTUAL_ENV-}" && -z "${VIRTUAL_ENV_DISABLE_PROMPT+x}" ]]; then
-    VENV=$(basename "${VIRTUAL_ENV}")
+    if [[ $VIRTUAL_ENV == "$(pwd)/.venv" ]]; then
+      VENV=$(basename "${VIRTUAL_ENV}")
+    else
+      VENV=$VIRTUAL_ENV
+    fi
+    PYTHON_VERSION=$(python --version | cut -d' ' -f2 | cut -d'.' -f1-2)
+    VENV="$VENV $PYTHON_VERSION"
     ACCUMULATED_VENV_PROMPT="${ACCUMULATED_VENV_PROMPT}${GIT_PROMPT_VIRTUALENV//_VIRTUALENV_/${VENV}}"
   fi
   if [[ -n "${NODE_VIRTUAL_ENV-}" && -z "${NODE_VIRTUAL_ENV_DISABLE_PROMPT+x}" ]]; then
```

## New var GIT_MESSAGE

bash-git-prompt holds an env var `$GIT_BRANCH` which equals to the current git branch name. For example `feat/#111/add-new-feature`. I want to have a new var `$GIT_MESSAGE` which equals to the commit message based on the current git branch. For example `feat/#111/add new feature`. Because in my `~/.bashrc`, I have an alias `gitpush`:

```bash
alias gitpush='git ci -am "$GIT_MESSAGE" ; git push origin $GIT_BRANCH`
```

So I can just type `gitpush` to commit and push my changes to the remote repo.

To achieve this, declare a function `set_git_message` in `~/.bash-git-prompt/gitprompt.sh` to set the `GIT_MESSAGE` variable based on the current branch name. Then, call `set_git_message` in the `updatePrompt` function in the same file to get called upon each prompt re-computation, for e.g. right after the line `export GIT_BRANCH=$(replaceSymbols "${git_status_fields[@]:0:1}")`.

```bash title="~/.bash-git-prompt/gitprompt.sh"
# given GIT_BRANCH :  feature/JIRA-123/some-feature
# got GIT_MESSAGE : feature/JIRA-123: some feature
function set_git_message() {

# Check if the string contains a '/'

  if [[ $GIT_BRANCH == */* ]]; then
      # If it does, get the substring after the last '/'
      MSG=${GIT_BRANCH##*/}
      # Get the prefix by removing the message part from the original string
      PREFIX=${GIT_BRANCH%/$MSG}
  else
      # If it doesn't, the whole string is the message
      PREFIX=""
      MSG=$GIT_BRANCH
  fi

# Replace "-" with " " in the message part

  MSG=${MSG//-/ }

# Combine prefix and message into the new variable
  if [[ -z $PREFIX ]]; then
      export GIT_MESSAGE="$MSG"
  else
      export GIT_MESSAGE="${PREFIX}: ${MSG}"
  fi
}
```
