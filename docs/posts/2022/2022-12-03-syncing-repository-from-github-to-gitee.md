---
authors:
- copdips
categories:
- git
comments: true
date:
  created: 2022-12-03
description: ''
---

# Syncing repository from github to gitee

I need to sync github repository (files and commits only) https://github.com/copdips/copdips.github.io to gitee repository https://gitee.com/copdips/copdips.github.io.

<!-- more -->

1. In gitee: create an empty repository, normal the same name as the one you want to sync from github. For example for this blog repository: https://gitee.com/copdips/copdips.github.io
2. In gitee: create a PAT in gitee with necessary permissions (`all` or `projects`).
   The sync needs to run two commands against to gitee:
   - `git push --all --force gitee`
   - `git push --tags --force gitee`
3. In github repository: create 2 secrets: `GITEE_USERNAME=copdips`, and `GITEE_PAT={PAT_created_in_the_previous_step}`
4. In github repository: create a github workflow, such as: [.github/workflows/sync-to-gitee.yml](https://github.com/copdips/copdips.github.io/blob/main/.github/workflows/sync-to-gitee.yml)
5. In github repository: push the above github workflow file to github, it will automatically trigger the first sync. And from now on, all the pushes to the `main` branch will trigger a such sync too. `main` is my default branch to trigger the sync, could be changed in the workflow file.

!!! note

    Github action within github free personal plan has a time limit at [2000 minutes per month](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions), which should be enough if you don't have many repositories and many pushes.
