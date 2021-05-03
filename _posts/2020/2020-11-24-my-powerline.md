---
last_modified_at:
title: "My Powerline setup and configuration"
excerpt: "Just my way to setup and configure powerline in WSL "
tags:
  - linux
  - wsl
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



If you're working in an enterprise environment, and you don't have the admin rights on your Windows desktop to install additional fonts, or your enterprise admin cannot do that, then I suggest you to **ignore this post**, powerline will be installed, but very ugly. If you have a Linux desktop, all will be OK, installing fonts doesn't need to be root.
{: .notice--warning}

- [https://github.com/powerline/powerline](https://github.com/powerline/powerline)

- [https://powerline.readthedocs.io/en/latest/configuration.html#quick-setup-guide](https://powerline.readthedocs.io/en/latest/configuration.html#quick-setup-guide)


## Installing powerline-status from pip

```bash
pip3 install powerline-status --user
pip3 show powerline-status
user_python_site_packages=$(pip3 show powerline-status | grep Location: | awk '{print $2}')
powerline_global_config_files_path="$user_python_site_packages/powerline/config_files"
mkdir -p ~/.config/powerline
cp -r $powerline_global_config_files_path/. ~/.config/powerline
```

## Installing fonts

https://powerline.readthedocs.io/en/latest/installation/linux.html#fonts-installation


```bash
apt install fontconfig
mkdir -p ~/.local/share/fonts/
mkdir -p ~/.config/fontconfig/conf.d/
wget https://github.com/powerline/powerline/raw/develop/font/PowerlineSymbols.otf
wget https://github.com/powerline/powerline/raw/develop/font/10-powerline-symbols.conf
mv PowerlineSymbols.otf ~/.local/share/fonts/
fc-cache -vf ~/.local/share/fonts/
mv 10-powerline-symbols.conf ~/.config/fontconfig/conf.d/
```

## Installing additional fonts

[https://github.com/powerline/fonts#quick-installation](https://github.com/powerline/fonts#quick-installation)

## Adding VIM support

- [https://powerline.readthedocs.io/en/latest/usage.html#vim-plugin-requirements](https://powerline.readthedocs.io/en/latest/usage.html#vim-plugin-requirements)

- [https://powerline.readthedocs.io/en/latest/usage/other.html#vim-statusline](https://powerline.readthedocs.io/en/latest/usage/other.html#vim-statusline)

If Python support is absent then Vim needs to be compiled with it. To do this use `--enable-pythoninterp` `./configure` flag (Python 3 uses `--enable-python3interp` flag instead). Note that this also requires the related Python headers to be installed. Please consult distribution’s documentation for details on how to compile and install packages.


Check VIM with python support:

```bash
vim --version | grep +python
```

if you don't have `+python` or `+python3`, you can install VIM from source by enable python support: [https://github.com/ycm-core/YouCompleteMe/wiki/Building-Vim-from-source](https://github.com/ycm-core/YouCompleteMe/wiki/Building-Vim-from-source)

Add following lines to `$HOME/.vimrc`:

```bash
python3 from powerline.vim import setup as powerline_setup
python3 powerline_setup()
python3 del powerline_setup
```

## Adding Ipython support

[https://powerline.readthedocs.io/en/latest/usage/other.html#ipython-prompt](https://powerline.readthedocs.io/en/latest/usage/other.html#ipython-prompt)

**Doesn't work for ipython v7+**: [https://github.com/powerline/powerline/issues/1953](https://github.com/powerline/powerline/issues/1953)

## Adding PBD support

[https://powerline.readthedocs.io/en/latest/usage/other.html#pdb-prompt](https://powerline.readthedocs.io/en/latest/usage/other.html#pdb-prompt)

## Adding Bash support

[https://powerline.readthedocs.io/en/latest/usage/shell-prompts.html#bash-prompt](https://powerline.readthedocs.io/en/latest/usage/shell-prompts.html#bash-prompt)

Add following lines to `~/.bashrc`:

> python path must be available before `powerline-daemon -q`

```bash
powerline-daemon -q
POWERLINE_BASH_CONTINUATION=1
POWERLINE_BASH_SELECT=1
. {repository_root}/powerline/bindings/bash/powerline.sh
```

## Adding Git support

[https://github.com/jaspernbrouwer/powerline-gitstatus](https://github.com/jaspernbrouwer/powerline-gitstatus)

```bash
pip3 install powerline-gitstatus
```

Add to `~/.config/powerline/colorschemes/default.json`:

```bash
{
  "groups": {
    "gitstatus":                 { "fg": "gray8",           "bg": "gray2", "attrs": [] },
    "gitstatus_branch":          { "fg": "gray8",           "bg": "gray2", "attrs": [] },
    "gitstatus_branch_clean":    { "fg": "green",           "bg": "gray2", "attrs": [] },
    "gitstatus_branch_dirty":    { "fg": "gray8",           "bg": "gray2", "attrs": [] },
    "gitstatus_branch_detached": { "fg": "mediumpurple",    "bg": "gray2", "attrs": [] },
    "gitstatus_tag":             { "fg": "darkcyan",        "bg": "gray2", "attrs": [] },
    "gitstatus_behind":          { "fg": "gray10",          "bg": "gray2", "attrs": [] },
    "gitstatus_ahead":           { "fg": "gray10",          "bg": "gray2", "attrs": [] },
    "gitstatus_staged":          { "fg": "green",           "bg": "gray2", "attrs": [] },
    "gitstatus_unmerged":        { "fg": "brightred",       "bg": "gray2", "attrs": [] },
    "gitstatus_changed":         { "fg": "mediumorange",    "bg": "gray2", "attrs": [] },
    "gitstatus_untracked":       { "fg": "brightestorange", "bg": "gray2", "attrs": [] },
    "gitstatus_stashed":         { "fg": "darkblue",        "bg": "gray2", "attrs": [] },
    "gitstatus:divider":         { "fg": "gray8",           "bg": "gray2", "attrs": [] }
  }
}
```

Add to `~/.config/powerline/themes/shell/default.json`:

```bash
{
    "function": "powerline_gitstatus.gitstatus",
    "priority": 40
}
```

Add to `~/.config/powerline/themes/shell/__main__.json`:

```bash
"gitstatus": {
    "args": {
        "show_tag": "exact"
    }
}
```
