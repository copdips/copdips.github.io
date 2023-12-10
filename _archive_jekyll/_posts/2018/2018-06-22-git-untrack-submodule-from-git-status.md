---
title: "Git untrack submodule from git status"
excerpt: "submodule folders cannot be added into .gitignore file to untrack them from git status, we will use ignore=dirty to ignore it"
tags:
  - git
  - submodule
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

When we have submodules in a git repo, even if we add the submodules' folders into the `.gitignore` file, these submodules folders are still tracked from the `git status` output.

# Method 1: .gitmodules file

There're several methods to ignore it, one of them is in `.gitmodules` file, add following line `ignore = dirty` under each submodule, example :
```s
[submodule "bundle/fugitive"]
    path = bundle/fugitive
    url = git://github.com/tpope/vim-fugitive.git
    ignore = dirty
```

# Method 2: switch --ignore-submodules=dirty

Another method is to use the swicth [`--ignore-submodules=dirty`](https://git-scm.com/docs/git-status#git-status---ignore-submodulesltwhengt) of `git status` (available from git version 1.7.2) and create an alias to shorten the typing.

> --ignore-submodules[=<when>]
>
> Ignore changes to submodules when looking for changes. <when> can be either "none", "untracked", "dirty" or "all", which is the default. Using "none" will consider the submodule modified when it either contains untracked or modified files or its HEAD differs from the commit recorded in the superproject and can be used to override any settings of the ignore option in git-config[1] or gitmodules[5]. When "untracked" is used submodules are not considered dirty when they only contain untracked content (but they are still scanned for modified content). Using "dirty" ignores all changes to the work tree of submodules, only changes to the commits stored in the superproject are shown (this was the behavior before 1.7.0). Using "all" hides all changes to submodules (and suppresses the output of submodule summaries when the config option status.submoduleSummary is set).


```powershell
> git status --ignore-submodules=dirty

# create the alias if you like
> git config --glo alias.gst='status --ignore-submodules=dirty'
```
