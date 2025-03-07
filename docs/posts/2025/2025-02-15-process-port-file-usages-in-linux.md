---
authors:
- copdips
categories:
- linux
- shell
- network
- web
comments: true
date:
  created: 2025-02-15
---

# Process, port, and file usages in Linux

Use `lsof`, `fuser`, `ss`, `pgrep`, `pstree`, `ps`, `htop`, etc. to find process, port and file usages in Linux.

<!-- more -->

## Finding process by port

### lsof by port

```bash
lsof -i:8080
lsof -i :8080

$ lsof -i:8000
COMMAND   PID  USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
uvicorn 40268 xiang    3u  IPv4 1054329      0t0  TCP localhost:8000 (LISTEN)
python3 40273 xiang    3u  IPv4 1054329      0t0  TCP localhost:8000 (LISTEN)

# with -t option to only display PID
$ lsof -ti:8000
40268
40273
```

#### killing process by lsof

```bash
kill -9 $(lsof -ti:8000)
```

### fuser

```bash
$ fuser 8000/tcp
8000/tcp:            40268 40273
8000/tcp:            40268 40273
```

#### killing process by fuser

In Linux, the command `fuser -k` is used to kill processes that are accessing a particular file, directory, or socket.

Basic syntax:

```bash
fuser -k [options] file_name/port/directory
```

```bash
fuser -k 8000/tcp

# useful for killing processes that are accessing a particular file or directory
# sometimes rm -rf returns errors like: "device or resource busy"
fuser -k filename
fuser -k /path/to/directory
```

Additional useful options:

- `-v`: Verbose output showing more details about the processes
- `-i`: Interactive mode that asks for confirmation before killing
- `-SIGNAL`: Specify a signal to send (default is SIGKILL) `fuser -k -TERM /var/log/syslog`

### ss

```bash
# find by port
$ ss -lapute | grep 8000
tcp   LISTEN     0      2048        127.0.0.1:8000          0.0.0.0:*     users:(("python3",pid=53146,fd=3),("uvicorn",pid=53141,fd=3)) uid:1002 ino:1271011 sk:1001 cgroup:/ <->

# find by name
00:30 $ ss -lapute | grep uvicorn
tcp   LISTEN     0      2048        127.0.0.1:8000          0.0.0.0:*     users:(("python3",pid=53146,fd=3),("uvicorn",pid=53141,fd=3)) uid:1002 ino:1271011 sk:1001 cgroup:/ <->

$ ss -lapute 'sport = :8000'

# only display PID
$ ss -lapute 'sport = :8000' | sed -r 's/.*pid=([0-9]+).*/\1/'

# Show all connections
ss

# Show listening sockets
ss -l

# Show TCP connections
ss -t

# Show UDP connections
ss -u

# Show connections to a specific port
ss -t state established '( dport = :ssh or sport = :ssh )'
```

## Finding process by name

### pgrep

```bash
pgrep:
 -n, --newest              select most recently started
 -o, --oldest              select least recently started

$ pgrep -f uvicorn
57506

$ pgrep -fa uvicorn
57506 /home/xiang/git/fastapi-demo/.venv/bin/python3 /home/xiang/git/fastapi-demo/.venv/bin/uvicorn app_sqlalchemy_v1.main:app --reload
```

### pstree

```bash
# -n for most recently started, -o for least recently started
$ pstree -p $(pgrep -n uvicorn)
uvicorn(57506)─┬─python3(57507)
               ├─python3(57508)───{python3}(57509)
               └─{uvicorn}(57510)

$ pgrep uvicorn | xargs pstree -p
uvicorn(57506)─┬─python3(57507)
               ├─python3(57508)───{python3}(57509)
               └─{uvicorn}(57510)

$ pstree -ps $(pgrep -n uvicorn)
systemd(1)───init-systemd(Ub(2)───SessionLeader(464)───Relay(466)(465)───sh(466)───sh(467)───sh(472)───node(476)───node(579)───bash(30994)───make(57499)───uvicorn(57506)─┬─python3(57507)
                                                                                                                                                                          ├─python3(57508)───{python3}(57509)
                                                                                                                                                                          └─{uvicorn}(57510)

$ pstree -pas $(pgrep uvicorn)
systemd,1
  └─init-systemd(Ub,2
      └─SessionLeader,422
          └─Relay(424),423
              └─bash,424
                  └─make,27286 run-sqlalchemy-v1
                      └─uvicorn,27293 /home/xiang/git/fastapi-demo/.venv/bin/uvicorn app_sqlalchemy_v1.main:app --reload
                          ├─python3,27294 -c from multiprocessing.resource_tracker import main;main(4)
                          ├─python3,27295 -c from multiprocessing.spawn import spawn_main; spawn_main(tracker_fd=5, pipe_handle=7) --multiprocessing-fork
                          │   └─{python3},27296
                          └─{uvicorn},27297
```

### ps

```bash
00:37 $  ps -faux | grep uvi -B3
xiang       1799  0.0  0.0   7932  7056 pts/9    Ss+  Feb14   0:00  |       |               |   \_ /bin/bash --init-file /home/xiang/.vscode-server/bin/e54c774e0add60467559eb0d1e229c6452cf8447/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-bash.sh
xiang      30994  0.0  0.0   7968  7252 pts/10   Ss   Feb14   0:00  |       |               |   \_ /bin/bash
xiang      57499  0.0  0.0   3500  2608 pts/10   S+   00:10   0:00  |       |               |   |   \_ make run-sqlalchemy-v1
xiang      57506 45.7  0.5 130272 54744 pts/10   Sl+  00:10  12:34  |       |               |   |       \_ /home/xiang/git/fastapi-demo/.venv/bin/python3 /home/xiang/git/fastapi-demo/.venv/bin/uvicorn app_sqlalchemy_v1.main:app --reload
--
root       69673  0.0  0.0   2784   220 ?        S    00:26   0:00      \_ /init
xiang      69681  0.0  0.0   7776  6972 pts/18   Ss   00:26   0:00          \_ -bash
xiang      77067  0.0  0.0   9988  5520 pts/18   R+   00:37   0:00              \_ ps -faux
xiang      77068  0.0  0.0   4092  2012 pts/18   S+   00:37   0:00              \_ grep --color=auto uvi -B3
```

### htop

Enter into `htop`, press `/` or `F3` to search for a process name, or press `F4` to filter by the process name, then `F9` to kill the process name.

## Finding files by process

### lsof by PID

```bash
# List all open files
lsof

# List files opened by a specific process ID
lsof -p 1234

# List files opened in a specific directory
lsof +D /var/log/
```

## Finding lines in input

```bash
# display lines containing "pattern" in {filename}
grep -n "pattern" {filename}

# grep -E is same as egrep
# Using grep -E with extended regex for alternation:
grep -E "cat|dog" {filename}

# Using grep -e to specify multiple explicit patterns:
grep -e "cat" -e "dog" {filename}
```

## Testing connection to a port

### echo to /dev/tcp

```bash
timeout 5 bash -c 'echo > /dev/tcp/127.0.0.1/8000' && echo "Port is open" || echo "Port is closed"
```

### nc

```bash
nc -zv 127.0.0.1 8000
```
