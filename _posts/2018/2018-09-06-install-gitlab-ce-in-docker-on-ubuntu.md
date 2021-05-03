---
title: "Install Gitlab-CE in Docker on Ubuntu"
excerpt: "Step by step installation of Gitlab-CE in docker on Ubuntu server."
tags:
  - gitlab
  - cicd
  - docker
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

> Gitlab-CE (Community Edition) is a completely free and powerful web-based Git-repository manager with wiki, issue-tracking and CI/CD pipeline features, using an open-source license, developed by GitLab Inc. There're already many much better docs on the net, I've never worked with Docker and Linux before, so I wrote this post to save my way to install the Gitlab docker version on Ubuntu, the post is more or less for personal purpose.

# Install Ubuntu server on Hyper-V

1. Enabled the free Hyper-V role on the Windows 10 PC.
2. Install Ubuntu server on the Hyper-V. (I used "Ubuntu 18.04.1 LTS")

Warning: **Don't install the snap version of Docker** during the Ubuntu install, I failed to run the Docker image after. There's an error saying that: *"docker: Error response from daemon: error while creating mount source path '/srv/gitlab/logs': mkdir /srv/gitlab: read-only file system."*. To remove the Docker snap: `sudo snap remove docker`.
{: .notice--warning}

# Install Docker on Ubuntu

Here is the [official doc](https://docs.docker.com/install/linux/docker-ce/ubuntu/) for installing Docker on Ubuntu, just follow the procedure step by step.

The docker group is created but no users are added to it. You need to use sudo to run Docker commands. Continue to [Linux postinstall](https://docs.docker.com/install/linux/linux-postinstall/) to allow non-privileged users to run Docker commands and for other optional configuration steps.

To verify Docker is running fine, we can try to run a hello-world image :
```bash
xiang@ubuntu1804:~$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
9db2ca6ccae0: Pull complete
Digest: sha256:4b8ff392a12ed9ea17784bd3c9a8b1fa3299cac44aca35a85c90c5e3c7afacdc
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/engine/userguide/
```

# Install Gitlab CE in Docker

Here is the [official Gitlab Docker doc](https://docs.gitlab.com/omnibus/docker/), I really thank the Gitlab team, their doc system is one of the bests that I've ever seen. Another [doc from IBM](https://developer.ibm.com/code/2017/07/13/step-step-guide-running-gitlab-ce-docker/) is also good. Run the following commands to install Gitlab-CE in Docker.

```bash
xiang@ubuntu1804:~$ docker run --detach \
--hostname gitlab.copdips.local \
--publish 443:443 --publish 80:80 --publish 2222:22 \
--name gitlab \
--restart always \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest

xiang@ubuntu1804:~$ docker ps
CONTAINER ID        IMAGE                          COMMAND             CREATED             STATUS                            PORTS                                                            NAMES
707439b39dd1        gitlab/gitlab-ce:latest  "/assets/wrapper"   3 minutes ago       Up 3 minutes (health: starting)   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 0.0.0.0:2222->22/tcp   gitlab
```

Warning: I use `--publish 2222:22` instead of `--publish 22:22` which is given by the official [Run the docker image](https://docs.gitlab.com/omnibus/docker/#run-the-image) doc, this is to avoid using the default SSH port (TCP 22) already binded to the Docker host, our Ubuntu server.
{: .notice--warning}

Warning: `Do NOT use port 8080` otherwise there will be conflicts. This port is already used by Unicorn that runs internally in the container.
{: .notice--warning}

Note: There's also a [Docker compose](https://docs.gitlab.com/omnibus/docker/#update-gitlab-using-docker-compose) way to install Gitlab-CE.
{: .notice--info}

# Check Gitlab

Open your browser, go to http://YourUbuntuServerIP/, you should see the Gitlab login page. On this page, you need to set the Gitlab root user initial password.

If you like to use HTTPS, you need to generate a SSL certificate and add it to Gitlab the config file.

# Run Gitlab in Kubernetes

IBM has provided a [doc](https://github.com/IBM/Kubernetes-container-service-GitLab-sample/blob/master/README.md) about it.
