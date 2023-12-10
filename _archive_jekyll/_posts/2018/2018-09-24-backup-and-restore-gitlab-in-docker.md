---
title: "Backup and restore Gitlab in docker"
excerpt: "Step by step procedure to backup and restore Gitlab in docker."
tags:
  - gitlab
  - cicd
  - docker
  - backup
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

> Gitlab hosts everything about the code including the docs and the pipeline data, etc. It's crucial to back it up. You can also use restore to migrate the Gitlab to another server. This post will show you how to backup and restore the Gitlab-CE docker version.

# Some docs on the Internet

1. [Backing up and restoring Gitlab from docs.gitlab.com](https://docs.gitlab.com/ee/raketasks/backup_restore.html)
2. [Gitlab omnibus backup from docs.gitlab.com](https://docs.gitlab.com/omnibus/settings/backups.html)
3. [Gitlab Backup from codereviewvideos.com](https://codereviewvideos.com/course/your-own-private-github/video/gitlab-backup)
4. [GitLab Backup Made Easy from icicletech.com](https://www.icicletech.com/blog/gitlab-backup-made-easy)

# Backup prerequisites

## Tar version
The [official doc](https://docs.gitlab.com/ee/raketasks/backup_restore.html#requirements) says that the backup and restore tasks use tar with minimum `version 1.3`. Check the tar version by `tar --version`. The default tar version installed by Gitlab with docker (Gitlab-CE v10.8.3) is v1.28, after the test, the backup and restore both work well with tar in version v1.28. After the test, I find that the default tar v1.28 is also good.

## VM snapshot

If your Gitlab is installed on a VM, you can create a snapshot before any action. Please note that **snapshot is not a backup**, you should delete it as soon as your backup or restore task is completed.

## Gitlab version

Be aware that we can only restore to exactly the same version and type of Gitlab. The default backup file has the Gitlab version and type in the end of the file name which is in the format `EPOCH_YYYY_MM_DD_GitLab_version`.

> <https://docs.gitlab.com/ee/raketasks/backup_restore.html#backup-timestamp>:
>
> The backup archive will be saved in `backup_path`, which is specified in the `config/gitlab.yml` file. The filename will be `[TIMESTAMP]_gitlab_backup.tar`, where `TIMESTAMP` identifies the time at which each backup was created, plus the GitLab version. The timestamp is needed if you need to restore GitLab and multiple backups are available.
>
> For example, if the backup name is `1493107454_2018_04_25_10.6.4-ce_gitlab_backup.tar`, then the timestamp is `1493107454_2018_04_25_10.6.4-ce`.

`config/gitlab.yml` is migrated to `/etc/gitlab/gitlab.rb` in newer Gitlab version
{: .notice--warning}

# Backup Gitlab in docker

## Locate backup path

`gitlab_rails['backup_path']` is commented in the Gitlab configuration file `gitlab.rb`, its value is the default backup path which is at `/var/opt/gitlab/backups`.

```bash
# From Gitlab docker

root@gitlab:/etc/gitlab# cat /etc/gitlab/gitlab.rb | grep backup_path
# gitlab_rails['manage_backup_path'] = true
# gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"
```

## Create the backup

You don't need to stop anything before creating the backup.

```bash
# From Ubuntu host outside of the Gitlab docker

xiang@ubuntu1804:~$ docker exec -it gitlab1083 gitlab-rake gitlab:backup:create
Dumping database ...
Dumping PostgreSQL database gitlabhq_production ... [DONE]
done
Dumping repositories ...
 * win/flaskapi ... [DONE]
 * win/flaskapi.wiki ...  [SKIPPED]
 * xiang/flaskapi ... [DONE]
 * xiang/flaskapi.wiki ...  [SKIPPED]
done
Dumping uploads ...
done
Dumping builds ...
done
Dumping artifacts ...
done
Dumping pages ...
done
Dumping lfs objects ...
done
Dumping container registry images ...
[DISABLED]
Creating backup archive: 1537738648_2018_09_23_10.8.3_gitlab_backup.tar ... done
Uploading backup archive to remote storage  ... skipped
Deleting tmp directories ... done
done
done
done
done
done
done
done
Deleting old backups ... skipping
xiang@ubuntu1804:~$
```

The backup uses the Linux commands `tar` and `gzip`. This works fine in most cases, but can cause problems when data is rapidly changing. When data changes while tar is reading it, the error `file changed as we read it` may occur, and will cause the backup process to fail. In such case, you add the copy strategy to your backup command like `docker exec -it gitlab1083 gitlab-rake gitlab:backup:create STRATEGY=copy`.
{: .notice--info}

## Check the backup

In fact, I created twice the backup, so we can see two backups here with different timestamps: `1537738648_2018_09_23_10.8.3`, `1537738690_2018_09_23_10.8.3`.

Notice that the backup file names don't contain the Gitlab type (ce for community edition), they only have the creation time (1537738648_2018_09_23 for the first backup file) and the Gitlab version (10.8.3).

We can also find that the backup account is `git`.

```bash
# From Gitlab docker

root@gitlab:/etc/gitlab# ls -lart /var/opt/gitlab/backups
total 644
drwxr-xr-x 19 root root   4096 Sep 22 23:52 ..
-rw-------  1 git  git  215040 Sep 23 21:37 1537738648_2018_09_23_10.8.3_gitlab_backup.tar
-rw-------  1 git  git  215040 Sep 23 21:38 1537738690_2018_09_23_10.8.3_gitlab_backup.tar
drwx------  2 git  root   4096 Sep 23 21:38 .
```

## Backup configuration and secret files

Yes, the configuration and secret files are not backed up during the [previous backup procedure](#create-the-backup). This is because the previous one [encrypts the some Gitlab data by using the secret key](https://docs.gitlab.com/ee/raketasks/backup_restore.html#storing-configuration-files) in the configuration and secret files. If you save them to the same place, you're just defeating the encryption.

So please also backup `/etc/gitlab/gitlab.rb` and `/etc/gitlab/gitlab-secrets.json` and save them to a secure place from other Gitlab backup data.

## Upload backups to remote storage

I haven't tested yet, here is the [official doc](https://docs.gitlab.com/ee/raketasks/backup_restore.html#uploading-backups-to-a-remote-cloud-storage).

# Restore Gitlab

You can only restore the Gitlab backup to exactly the same Gitlab version and type. And you also need to have a working Gitlab instance.

## Stop some Gitlab services

```bash
# From Gitlab docker

gitlab-ctl reconfigure
gitlab-ctl start
gitlab-ctl stop unicorn
gitlab-ctl stop sidekiq
gitlab-ctl status
ls -lart /var/opt/gitlab/backups
```

## Start the restore

The backup file must can be found in the [backup path](#locate-backup-path), which is defined in the configuration file `/etc/gitlab/gitlab.rb` by the key `gitlab_rails['backup_path']`.

```bash
# From Ubuntu host outside of the Gitlab docker

xiang@ubuntu1804:~$ docker exec -it gitlab1083 gitlab-rake gitlab:backup:restore --trace
** Invoke gitlab:backup:restore (first_time)
** Invoke gitlab_environment (first_time)
** Invoke environment (first_time)
** Execute environment
** Execute gitlab_environment
** Execute gitlab:backup:restore
Unpacking backup ... done
Before restoring the database, we will remove all existing
tables to avoid future upgrade problems. Be aware that if you have
custom tables in the GitLab database these tables and all data will be
removed.

Do you want to continue (yes/no)? yes
Removing all tables. Press `Ctrl-C` within 5 seconds to abort
(...)
COPY 0
 setval
--------
      1
(1 row)

COPY 0
 setval
--------
      1
(1 row)
(...)
ALTER TABLE
ALTER TABLE
(...)
CREATE INDEX
(...)
ALTER TABLE
ALTER TABLE
(...)
WARNING:  no privileges were granted for "public"
GRANT
[DONE]
done
** Invoke gitlab:backup:repo:restore (first_time)
** Invoke gitlab_environment
** Execute gitlab:backup:repo:restore
Restoring repositories ...
 * win/flaskapi ... [DONE]
 * xiang/flaskapi ... [DONE]
Put GitLab hooks in repositories dirs [DONE]
done
** Invoke gitlab:backup:uploads:restore (first_time)
** Invoke gitlab_environment
** Execute gitlab:backup:uploads:restore
Restoring uploads ...
done
** Invoke gitlab:backup:builds:restore (first_time)
** Invoke gitlab_environment
** Execute gitlab:backup:builds:restore
Restoring builds ...
done
** Invoke gitlab:backup:artifacts:restore (first_time)
** Invoke gitlab_environment
** Execute gitlab:backup:artifacts:restore
Restoring artifacts ...
done
** Invoke gitlab:backup:pages:restore (first_time)
** Invoke gitlab_environment
** Execute gitlab:backup:pages:restore
Restoring pages ...
done
** Invoke gitlab:backup:lfs:restore (first_time)
** Invoke gitlab_environment
** Execute gitlab:backup:lfs:restore
Restoring lfs objects ...
done
** Invoke gitlab:shell:setup (first_time)
** Invoke gitlab_environment
** Execute gitlab:shell:setup
This will rebuild an authorized_keys file.
You will lose any data stored in authorized_keys file.
Do you want to continue (yes/no)? yes

** Invoke cache:clear (first_time)
** Invoke cache:clear:redis (first_time)
** Invoke environment
** Execute cache:clear:redis
** Execute cache:clear
Deleting tmp directories ... done
done
done
done
done
done
done
done
xiang@ubuntu1804:~$
```

We can also add the param BACKUP to specify the backup file if there're more than one backup tar file in the backup path. The value of the BACKUP is the [backup file timestamp](#gitlab-version), for example : `docker exec -it gitlab1083 gitlab-rake gitlab:backup:restore BACKUP=1537738690_2018_09_23_10.8.3 --trace`.
{: .notice--info}

## Restart Gitlab with sanity check

Restart the Gitlab services by `gitlab-ctl restart`:

```bash
# From Gitlab docker

root@gitlab:/# gitlab-ctl restart
ok: run: alertmanager: (pid 2789) 1s
ok: run: gitaly: (pid 2797) 0s
ok: run: gitlab-monitor: (pid 2806) 0s
ok: run: gitlab-workhorse: (pid 2811) 1s
ok: run: logrotate: (pid 2827) 0s
ok: run: nginx: (pid 2834) 1s
ok: run: node-exporter: (pid 2839) 0s
ok: run: postgres-exporter: (pid 2845) 1s
ok: run: postgresql: (pid 2855) 0s
ok: run: prometheus: (pid 2864) 0s
ok: run: redis: (pid 2873) 1s
ok: run: redis-exporter: (pid 2877) 0s
ok: run: sidekiq: (pid 2957) 0s
ok: run: sshd: (pid 2960) 0s
ok: run: unicorn: (pid 2968) 1s
```

Launch the Gitlab sanity check by `gitlab-rake gitlab:check SANITIZE=true`:

```bash
root@gitlab:/# gitlab-rake gitlab:check SANITIZE=true
Checking GitLab Shell ...

GitLab Shell version >= 7.1.2 ? ... OK (7.1.2)
Repo base directory exists?
default... yes
Repo storage directories are symlinks?
default... no
Repo paths owned by git:root, or git:git?
default... yes
Repo paths access is drwxrws---?
default... yes
hooks directories in repos are links: ...
3/2 ... ok
2/3 ... ok
Running /opt/gitlab/embedded/service/gitlab-shell/bin/check
Check GitLab API access: FAILED: Failed to connect to internal API
gitlab-shell self-check failed
  Try fixing it:
  Make sure GitLab is running;
  Check the gitlab-shell configuration file:
  sudo -u git -H editor /opt/gitlab/embedded/service/gitlab-shell/config.yml
  Please fix the error above and rerun the checks.

Checking GitLab Shell ... Finished

Checking Sidekiq ...

Running? ... no
  Try fixing it:
  sudo -u git -H RAILS_ENV=production bin/background_jobs start
  For more information see:
  doc/install/installation.md in section "Install Init Script"
  see log/sidekiq.log for possible errors
  Please fix the error above and rerun the checks.

Checking Sidekiq ... Finished

Reply by email is disabled in config/gitlab.yml
Checking LDAP ...

LDAP is disabled in config/gitlab.yml

Checking LDAP ... Finished

Checking GitLab ...

Git configured correctly? ... yes
Database config exists? ... yes
All migrations up? ... yesyes
Database contains orphaned GroupMembers? ... nono
GitLab config exists? ... yes
GitLab config up to date? ... yes
Log directory writable? ... yes
Tmp directory writable? ... yes
Uploads directory exists? ... yes
Uploads directory has correct permissions? ... yes
Uploads directory tmp has correct permissions? ... yes
Init script exists? ... skipped (omnibus-gitlab has no init script)
Init script up-to-date? ... skipped (omnibus-gitlab has no init script)
Projects have namespace: ...
3/2 ... yesyes
2/3 ... yes
Redis version >= 2.8.0? ... yes
Ruby version >= 2.3.5 ? ... yes
Ruby version >= 2.3.5 ? ... yes (2.3.7)
Git version >= 2.9.5 ? ... yes (2.16.4)yes (2.3.7)
Git version >= 2.9.5 ? ... yes (2.16.4)
Git user has default SSH configuration? ... yes
Active users: ... 2

Checking GitLab ... Finished

root@gitlab:/#
```

Verify the Gitlab container health by `docker ps`:

```bash
# From Ubuntu host outside of the Gitlab docker

xiang@ubuntu1804:~$ docker ps
CONTAINER ID        IMAGE                          COMMAND             CREATED             STATUS
PORTS                                                            NAMES
707439b39dd1        gitlab/gitlab-ce:10.8.3-ce.0   "/assets/wrapper"   2 weeks ago         Up 15 minutes (healthy)
0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 0.0.0.0:2222->22/tcp   gitlab1083
```
