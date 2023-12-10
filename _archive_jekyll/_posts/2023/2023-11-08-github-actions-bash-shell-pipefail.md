---
last_modified_at:
title: "Github Actions - Bash shell -e -o pipefail"
excerpt: ""
tags:
  - cicd
  - githubaction
  - shell
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

Bash shell in Github actions by default is run with `-e -o pipefail` option. The full command used by Github actions is :

```bash
shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}
```

`-o pipefail` means that if any command in a pipeline fails, that return code will be used as the return code of the whole pipeline. And due to `-e` option, this makes the shell exit immediately if a command within the script exits with a non-zero status (i.e., fails). This is a good thing, but it can be a problem if you want to ignore the return code of a command in a pipeline. And especially in Github Actions output, you cannot see the error message of the command that failed. Github Actions just shows a generic error message: "**Error: Process completed with exit code 1.**", which makes it hard to debug.

For example, following command:

- will **success** even `grep` does not find anything in a standard bash shell (your local VM for example)
- but will **fail** in Github actions bash shell with the error message "**Error: Process completed with exit code 1.**".

```bash
echo "hello world" | grep "foo" | wc -l
```

If you do not care about the grep result, to bypass this, you can use `|| true` at the end of the `grep` command. This will make sure that the return code of the grep command is always 0.

```bash
echo "hello world" | { grep "foo" || true ; } | wc -l
```

To verify current bash shell options, you can use `set -o` command:

```bash
set -o
# or
$ set -o | grep -E "errexit|pipefail"
errexit         off
pipefail        off
```
