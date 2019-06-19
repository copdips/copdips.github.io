---
title: "Git Cheat Sheet"
excerpt: "Some personal often forgotten git commands."
tags:
  - git
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

{% include toc title="Table of content" %}

> This is not a complete Git cheat sheet for everyone, this is just a personal cheat sheet for some often forgotten git commands.


# Undo


## Discard changes in working directory

```bash
# discard changes to a file in working directory
git checkout <filename or wildcard>

# discard changes to all files in working directory
git checkout .
# or
git checkout *
```

Untracked files cannot be discarded by checkout.
{: .notice--info}


## Unstage from staging area

[StackOverflow: How do I undo git add before commit?](https://stackoverflow.com/questions/348170/how-do-i-undo-git-add-before-commit)

```bash
# unstage a file from staging area
git reset <filename or wildcard>

# unstage all files from staging area
git reset
```

No more need to add `HEAD` like `git reset HEAD <file>` and `git reset HEAD` since git v1.8.2.
{: .notice--info}

Dont use `git rm --cached <filename>` to unstage, it works only for newly created file to remove them from the staging area. But if you specify a existing file, it will delete it from cache, even if it is not staged.
{: .notice--warning}


## Undo commit to working directory

[StackOverflow: How do I undo the most recent local commits in Git?](https://stackoverflow.com/questions/927358/how-do-i-undo-the-most-recent-local-commits-in-git)

> You should readd the files if you want to commit them, as they're in the working directory now, they're unstaged too.

```bash
# Undo last commit to working directory
git reset head~
# same as to
git reset head~1

# Undo last 2 commits to working directory
git reset head~2

# Undo till a special commit to working directory,
# the special commit and every commits before are still committed.
git reset <commit number>
```

`git reset head` will do nothing, as the head is already at the last commit.
{: .notice--info}


## Undo commit to staging area

[StackOverflow: How do I undo the most recent local commits in Git?](https://stackoverflow.com/questions/927358/how-do-i-undo-the-most-recent-local-commits-in-git)

> Often used to just change a commit message, because the uncommitted files have already been staged.

```bash
# Undo last commit to staging area
git reset --soft head~
# same as to
git reset --soft head~1

# Undo the last 2nd commit to staging area,
# and all the after (the last commit in this case) to working directory
git reset --soft head~2

# Undo till a special commit to staging area,
# the special commit and every commits before are still committed.
git reset --soft <commit number>
```

`git reset head` will do nothing, as the head is already at the last commit.
{: .notice--info}

`git reset --hard head~` will undo the last commit (head~) and also delete the changes from the working directory. This is like doing `git reset head~ ; git checkout .` .
If you want to rollback the `reset --hard`, and you have the discarded commit number, you can rollback by `git cherry-pick <commit number>`
{: .notice--warning}

# GUI

GitForWindows ships with a GUI tool, very cool.

```bash
# start git gui tool
git gui
```

![git-gui](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2019-06-19-git-cheat-sheet/git-gui.PNG)
