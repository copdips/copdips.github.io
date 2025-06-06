---
authors:
- copdips
categories:
- git
- ssh
comments: true
date:
  created: 2023-09-04
description: ''
---

# Different ssh keys for different github.com accounts

It might be a common case that you have multiple github.com accounts (personal and professional), and you want to use different ssh keys for different github accounts, as github.com does not allow same ssh key for different accounts with *"Key is already in use"* error.

To achieve this, you could follow this [tutorial](https://vanthanhtran245.github.io/use-multiple-ssh-key-for-different-git-accounts/):

<!-- more -->

1. Generate ssh keys for each github.com account. For e.g. `~/.ssh/id_rsa` and `~/.ssh/id_rsa_pro`.
2. Create a `~/.ssh/config` file to specify which ssh key to use for which github account.

    ```bash
    Host github.com
    HostName github.com
    IdentityFile ~/.ssh/id_rsa
    User copdips

    # The HostName is still github.com, but the host here is github.com-pro, this is the key point.
    # You can change it to whatever you want
    Host github.com-pro
    HostName github.com
    IdentityFile ~/.ssh/id_rsa_pro
    User copdips-pro
    ```

3. Git clone the repositories by replacing `github.com` in the git clone ssh url with the ssh alias defined in `~/.ssh/config`.
   Say the pro ssh clone url is: **git@`github.com`:my-company/repo.git**, than you need to rewrite it to **git@`github.com-pro`:my-company/repo.git** to be able to use the ssh key `~/.ssh/id_rsa_pro` defined in `~/.ssh/config`.

!!! note

    In Chrome (so as to Edge), there's an extension called [MultiLogin](https://chrome.google.com/webstore/detail/multilogin/ijfgglilaeakmoilplpcjcgjaoleopfi) that allows you to use multiple accounts (for e.g. personal and professional github.com accounts) across different tabs in the same browser instance. So you do not need to keep two browser instances opened at the same time. In Firefox, you even have a better extension called [Firefox Multi-Account Containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/).
