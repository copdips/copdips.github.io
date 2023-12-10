---
title: "Update Gitlab in docker"
excerpt: "Step by step procedure to update Gitlab in docker."
tags:
  - gitlab
  - cicd
  - docker
  - update
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

> Gitlab has several methods to update to newer version depending on the type of the original installation and the Gitlab version. This post will show you the way for docker version of Gitlab, which is the simplest among others.

# Some docs on the Internet

This post will follow the [official doc for updating docker version of Gitlab](https://docs.gitlab.com/omnibus/docker/README.html#upgrade-gitlab-to-newer-version).

If you installed the [Gitlab with docker compose](https://docs.gitlab.com/omnibus/docker/README.html#install-gitlab-using-docker-compose), please follow [this official procedure](https://docs.gitlab.com/omnibus/docker/README.html#update-gitlab-using-docker-compose).

And hereunder some docs for the non docker version update if you are interested:
1. [Official global Gitlab update doc](https://docs.gitlab.com/ee/update/)
2. [Official doc for upgrading without downtime](https://docs.gitlab.com/ee/update/#upgrading-without-downtime)
3. [Official doc for updating Gitlab installed from source](https://gitlab.com/gitlab-org/gitlab-ce/tree/master/doc/update)
4. [Official doc for patching between minor feature versions](https://docs.gitlab.com/ee/update/patch_versions.html)
5. [Official doc for restoring from backup after a failed upgrade](https://docs.gitlab.com/ee/update/restore_after_failure.html)



# Backup before anything

We must backup the Gitlab before everything. I've already written [a post](https://copdips.com/2018/09/backup-and-restore-gitlab-in-docker.html#backup-gitlab-in-docker) on how to backup up Gitlab docker version.

# Verify the docker container volumes

The update procedure will remove the current Gitlab container, so the data must be kept somewhere to be reused by the update. As I wrote in [a previous post](https://copdips.com/2018/09/install-gitlab-ce-in-docker-on-ubuntu.html#install-gitlab-ce-in-docker) on how to install Gitlab in docker, we used the `docker run --volume` to mount the docker host volumes to Gitlab container. So even the Gitlab container is removed, the data are still kept in the docker host.

To verify the mounted volumes:

```bash
xiang@ubuntu1804:~$ docker ps
CONTAINER ID        IMAGE                          COMMAND             CREATED             STATUS                 PORTS                                                            NAMES
707439b39dd1        gitlab/gitlab-ce:10.8.3-ce.0   "/assets/wrapper"   3 weeks ago         Up 2 hours (healthy)   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 0.0.0.0:2222->22/tcp   gitlab
xiang@ubuntu1804:~$
xiang@ubuntu1804:~$ docker container inspect -f {% raw %}"{{ json .HostConfig.Binds }}"{% endraw %} gitlab | python3 -m json.tool
[
    "/srv/gitlab/config:/etc/gitlab",
    "/srv/gitlab/logs:/var/log/gitlab",
    "/srv/gitlab/data:/var/opt/gitlab"
]
```

Ok, I see there're three volumes mounted in the Gitlab container, it's good.

# Update docker version of Gitlab

Exactly the same procedure as [the official one](https://docs.gitlab.com/omnibus/docker/#upgrade-gitlab-to-newer-version). I will update the current gitlab-ce:10.8.3-ce.0 to gitlab-ce:latest

1. Pull the new image:

   To pull other version, change the `lastest` by the tag name which can be found from the [docker hub](https://hub.docker.com/r/gitlab/gitlab-ce/tags/).

    ```bash
    docker pull gitlab/gitlab-ce:latest

    ```

2. Stop the running container called gitlab:
    ```bash
    docker stop gitlab
    ```

3. Remove existing container:
    ```bash
    docker rm gitlab
    ```

4. Create the container once again with [previously specified options](https://copdips.com/2018/09/install-gitlab-ce-in-docker-on-ubuntu.html#install-gitlab-ce-in-dockers):
    ```bash
    docker run --detach \
    --hostname gitlab.copdips.local \
    --publish 443:443 --publish 80:80 --publish 2222:22 \
    --name gitlab \
    --restart always \
    --volume /srv/gitlab/config:/etc/gitlab \
    --volume /srv/gitlab/logs:/var/log/gitlab \
    --volume /srv/gitlab/data:/var/opt/gitlab \
    gitlab/gitlab-ce:latest
    ```

That's all, go to take a coffee, GitLab will reconfigure and update itself, the procedure is pretty simple.

If you take a look at [the procedure for Gitlab installed from the source](https://gitlab.com/gitlab-org/gitlab-ce/tree/master/doc/update), you will thank yourself for choosing to install Gitlab in docker, because you chose the zen.
