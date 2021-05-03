---
title: "Creating Multiple Redis Instance Services On Windows"
excerpt: "Creating multiple Redis instance as Windows service on the same Windows server."
tags:
  - powershell
  - service
  - redis
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

> Even Salvatore Sanfilippo (creator of Redis) thinks it's [a bad idea](https://stackoverflow.com/a/36498590) to use multiple DBs in Redis. So we can install as many Redis instances as the number of DBs we need. This post will show you how to create multiple Redis instance as Windows service on the same Windows server.

# Choose Redis Windows port version

As mentioned by [the official doc](https://redislabs.com/ebook/appendix-a/a-3-installing-on-windows/a-3-1-drawbacks-of-redis-on-windows/), due to the lack of fork on Windows system, Redis is not officially supported on Windows. For Windows port version of Redis, we can use the one from : https://github.com/MicrosoftArchive/redis , currently the latest version is [v3.2.100](https://github.com/MicrosoftArchive/redis/releases/tag/win-3.2.100) which was released on Jul 1, 2016.

# Create single Redis service on Windows

[The official doc](https://redislabs.com/blog/redis-on-windows-8-1-and-previous-versions/) is good enough to get the job done. You can create the service by a simple command:

```powershell
> redis-server --service-install
```

Or if you want to use a customized configuration:

```powershell
> redis-server --service-install redis.windows.conf --loglevel verbose
```

BTW, if you want to use Redis in the Windows Subsystem for Linux (WSL) on Windows 10 or on Windows Server 2019, you can refer to [this official doc](https://redislabs.com/blog/redis-on-windows-10/).

# Create multiple Redis services on Windows

There's no many docs on the Internet telling you how to achieve that, in fact [the doc from the Github](https://github.com/MicrosoftArchive/redis/blob/3.0/Windows%20Service%20Documentation.md#naming-the-service) gives the answer. We should use the magic `--service-name`.

```powershell
# Create redis service which name is redis_6381 and listens to the port tcp 6381
> redis-server --service-install --service-name redis_6381 --port 6381

# Create redis service which name is redis_6382 and listens to the port tcp 6382
> redis-server --service-install --service-name redis_6382 --port 6382
```

We just created 2 Redis server services on Windows, the only difference between them is the ports they listen to. All the other configurations are the default ones. This provokes a problem. That is the [rdb dump file](https://redis.io/topics/persistence). The default configure set the rdb file name to dump.rdb, so both the redis services are using the same dump.rdb file which creates the file conflict in case of [SAVE command](https://redis.io/commands/save) or [BGSAVE command](https://redis.io/commands/bgsave).

Due to above problem, we need to set each redis service uses its own rdb file.
In redis config, there're two configurations to control the rdb file.

1. rbd file folder

    ```shell
    # from redis-cli
    config get dir
    config set dir [new dir path]
    ```

2. rdb file name

    ```shell
    # from redis-cli
    config get dbfilename
    config set dbfilename [new db file name]
    ```

Don't forget to set also the `maxmemory` and [`maxmemory-policy`](https://redis.io/topics/lru-cache) in order to avoid the out of memory issue. Redis' default `maxmemory` is set to `0` which means no limitation on used memory, and the default `maxmemory-policy` is set to `noeviction`, which means the Redis server returns errors when the memory limit was reached and the client is trying to execute commands that could result in more memory to be used.

To get Redis memory usage, use :
```shell
# from redis-cli
info memory
```
