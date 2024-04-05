---
authors:
- copdips
categories:
- python
- container
- docker
- vault
- cicd
comments: true
date:
  created: 2024-04-06
---

# Dockerfile with secrets

The most secure way to use secrets in a Dockerfile is to use the `--secret` flag in the `docker build` command. This way, the secret is not stored in the image, and it is not visible in the Dockerfile.

A common use case in Python world is to install packages from a private PyPI repository in a Dockerfile. Suppose during the CICD pipeline, there's an environment variable called `PIP_INDEX_URL` where holds this private PyPI credentials.

Check the official [Build secrets doc](https://docs.docker.com/build/building/secrets/).

<!-- more -->

## Docker build

It will search `PIP_INDEX_URL` from environment variables.

```bash title="docker build with secrets"
# for older version of Docker Engine earlier than 23.0, need to enable buildkit in advance:
# https://docs.docker.com/build/buildkit/#getting-started
export DOCKER_BUILDKIT=1

docker build --secret id=PIP_INDEX_URL -t myimage .
```

## Dockerfile

By default, `--secret id=PIP_INDEX_URL` from `docker build` will be mounted to file `/run/secrets/PIP_INDEX_URL`.

```Dockerfile title="Dockerfile with secrets"
...
RUN --mount=type=secret,id=PIP_INDEX_URL \
    pip install --upgrade pip && \
    PIP_INDEX_URL=$(cat /run/secrets/PIP_INDEX_URL) pip install --no-cache-dir -r requirements.txt
...
```

!!! note "--build-arg to add args"
    https://docs.docker.com/build/building/variables/#arg-usage-example

    ```bash title="docker build with args"
    docker build --build-arg arg1=value1 --build-arg arg2=value2 -t myimage .
    ```

    ```Dockerfile title="Dockerfile with args"
    ARG arg1
    ARG arg2
    RUN printf "\narg1: $arg1\narg2: $arg2\n" >> /tmp/args.txt
    ```
