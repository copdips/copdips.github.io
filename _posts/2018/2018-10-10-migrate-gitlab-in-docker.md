---
title: "Migrate Gitlab in docker"
excerpt: "Step by step procedure to update Gitlab in docker."
tags:
  - gitlab
  - cicd
  - docker
  - migration
  - ubuntu
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

> This post will walk you through the steps to migrate Gitlab from one docker container to another. The steps need you to know how to install a new Gitlab container and how to backup and restore Gitlab container, because the migration is just a restoration of a backup to another container.

# Some docs on the Internet

1. [Migrate GitLab Instance to new Host](https://pikedom.com/migrate-gitlab-instance-to-new-host/)

# Backup before anything

We must backup the Gitlab before everything. I've already written [a post](https://copdips.com/2018/09/backup-and-restore-gitlab-in-docker.html#backup-gitlab-in-docker) on how to backup up Gitlab docker version. For a double insurance, you can also at first create a VM snapshot/checkpoint, but don't forget to delete it as soon as the migration is successfully finished.

In this post, we'll also use this backup to migrate the date to the new Gitlab container. The backup file name is `1538845523_2018_10_06_11.3.1_gitlab_backup.tar`.

## Backup host key (optional)

If rebuilding the machine and keeping the same IP, to avoid having to delete the host key entry in the ~/.ssh/know_hosts file, run the following to backup the SSH host keys.

```bash
# From gitlab docker container

root@gitlab:/# tar -cvf $(date "+hostkeys-%s.tar") $(grep HostKey /etc/ssh/sshd_config | grep -v ^'#' | awk '{print $2}')
```

# Install a new Gitlab in docker with the same version

I've already written [a post](https://copdips.com/2018/09/install-gitlab-ce-in-docker-on-ubuntu.html#install-gitlab-ce-in-docker) on how to install Gitlab-CE in docker. Be aware that for this container installation inside the same Ubuntu VM, we should map some new volumes and provide a new container name. If you install Gitlab container in another VM, of course you can reuse the same volume name and container name.

# Verify the new Gitlab SSL certificate before the migration

Depends on your client OS (Linux or Windows), you can use [the commands here](https://copdips.com/2018/09/setup-https-for-gitlab.html#check-the-website-ssl-certificate-from-the-command-line) to verify the SSL certificate. The mine is a Windows 10. Note that the certificate's serial number is `8c:87:45:ab:b9:04:b0:ae`.

```powershell
6.1.0> $null | openssl s_client -connect gitlab.copdips.local:443 | openssl x509 -text -noout
depth=0 O = copdips, CN = gitlab.copdips.local
verify error:num=18:self signed certificate
verify return:1
depth=0 O = copdips, CN = gitlab.copdips.local
verify return:1
DONE
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            8c:87:45:ab:b9:04:b0:ae
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: O=copdips, CN=gitlab.copdips.local
        Validity
            Not Before: Oct  2 21:00:13 2018 GMT
            Not After : Jun 28 21:00:13 2021 GMT
        Subject: O=copdips, CN=gitlab.copdips.local
(...)
```

# Transfer the backup

Copy the backup file `1538845523_2018_10_06_11.3.1_gitlab_backup.tar` to the new Gitlab. From the backup name, we know the old gitlab version is at v11.3.1, this version must be exaclty the same as the new Gitlab.

To verify current Gitlab docker version:

```bash
# From gitlab docker container

root@gitlab:/# gitlab-rake gitlab:env:info | grep "GitLab information" -A2
GitLab information
Version:        11.3.1
Revision:       32cb452
```

Transfer the backup file:

```bash
# From Ubuntu host outside of the Gitlab docker container

xiang@ubuntu1804:~$ sudo cp \
 /srv/gitlab1083/data/backups/1538845523_2018_10_06_11.3.1_gitlab_backup.tar \
 /srv/gitlab-new/data/backups/
```

# Check the backup permission

The backup file must be owned by `git` account. The previous copy make the file's owner as `root:root`, so we need to change it.

```bash
# From gitlab docker container

root@gitlab:/# ls -lart /var/opt/gitlab/backups
total 344
-rw-------  1 git  git   81920 Oct  2 21:33 1538516038_2018_10_02_10.8.3_gitlab_backup.tar
drwx------  8 git  git    4096 Oct  2 21:40 tmp
-rw-------  1 root root 256000 Oct  8 21:00 1538845523_2018_10_06_11.3.1_gitlab_backup.tar
drwx------  3 git  root   4096 Oct  8 21:00 .
drwxr-xr-x 20 root root   4096 Oct  8 21:06 ..
root@gitlab:/# chown -v git:git /var/opt/gitlab/backups/1538845523_2018_10_06_11.3.1_gitlab_backup.tar
changed ownership of '/var/opt/gitlab/backups/1538845523_2018_10_06_11.3.1_gitlab_backup.tar' from root:root to git:git
```

# Migrate by restoring from the backup

For docker version of Gitlab, the migration is just a [standard restoration procedure](https://copdips.com/2018/09/backup-and-restore-gitlab-in-docker.html#restore-gitlab).

## Stop unicorn and sidekiq
```bash
# From gitlab docker container

root@gitlab:/# gitlab-ctl reconfigure
gitlab-ctl start
gitlab-ctl stop unicorn
gitlab-ctl stop sidekiq
gitlab-ctl status
ls -lart /var/opt/gitlab/backups
```

## Start restore

```bash
# From Ubuntu host outside of the Gitlab docker container

xiang@ubuntu1804:~$ docker exec -it gitlab gitlab-rake gitlab:backup:restore BACKUP=1538845523_2018_10_06_11.3.1 --trace
```

## Start Gitlab

```bash
# From Gitlab docker container

root@gitlab:/# gitlab-ctl restart
root@gitlab:/# gitlab-rake gitlab:check SANITIZE=true
```

# Verify

## Verify the config file gitlab.rb

The config file is not replaced by the backup. If you want to use the config from the old container, just copy the file, and restart Gitlab by `gitlab-ctl reconfigure` from the docker container or `docker restart [container name]` from the docker host. To locate the config file, you can refer to [this post](https://copdips.com/2018/09/setup-https-for-gitlab.html#configure-https-on-gitlab).

## Verify SSL certificate

By [rechecking the SSL certificate](https://copdips.com/2018/10/migrate-gitlab-in-docker.html#verify-the-new-gitlab-ssl-certificate-before-the-migration), the SSL certificate is not replaced. If you want to keep the old certificate especially if your certificate is self-signed, you need to copy it from the old container's volume. You can check [this post](https://copdips.com/2018/09/setup-https-for-gitlab.html#save-the-ssl-certificate) to locate the SSL certificate.

## Verify local user accounts

The local user accounts are replaced by the backup. Good.

## Verify repositories

The repositories are replaced by the backup. Good.

## Verify Gitlab runner

The Gitlab runner are replaced by the backup. Good.

But if the Gitlab SSL certificate is **self-signed**, and you dont want to restore the old one from the old container, you need to import the new self-signed SSL certificate to all Gitlab runners's cert store, at least for Windows runners, Linux runners are not tested because I'm still a novice on Linux.
{: .notice--warning}

Please take a look at the line starting by `Import-Certificate` from [this post](https://copdips.com/2018/09/install-gitlab-runner-on-windows-by-powershell-psremoting.html#register-gitlab-runner-on-windows) to learn how to import the certificate to the `Trusted Root Certification Authorities` logical store in the [Windows certificate store](https://docs.microsoft.com/en-us/windows/desktop/seccertenroll/about-certificate-directory).
