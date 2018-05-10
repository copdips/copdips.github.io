{% include toc title="Table of content" %}

https://github.com/juthilo/run-jekyll-on-windows/

Install Ruby + Devkit :
https://rubyinstaller.org/downloads/

> Which Development Kit?
>
>  rubyinstaller.org: Starting with Ruby 2.4.0 we use the MSYS2 toolchain as our development kit. When using the Ruby+Devkit installer version, it is a selectable component, so that no additional downloads/installs are required.
>
>  When using the Ruby without Devkit version, the MSYS2 Devkit can be installed separately by running ridk install. MSYS2 is required to build native C/C++ extensions for Ruby and is necessary for Ruby on Rails. Moreover it allows the download and usage of hundreds of Open Source libraries which Ruby gems can depend on.


Change gem source if banned in China:
```ruby
gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
```

Open a console:
```ruby
gem install jekyll

Done installing documentation for public_suffix, addressable, colorator, http_parser.rb, eventmachine, em-websocket, concurrent-ruby, i18n, rb-fsevent, ffi, rb-inotify, sass-listen, sass, jekyll-sass-converter, ruby_dep, listen, jekyll-watch, kramdown, liquid, mercenary, forwardable-extended, pathutil, rouge, safe_yaml, jekyll after 55 seconds
25 gems installed
```

```ruby
gem install jekyll-paginate

    jekyll 是用来依照模板生成网站的，是 GitHub Pages 的基础
    jekyll-paginate 是 paginate 属性用的，可以用来显示文章列表、文章摘要

gem install bundler
bundler install
gem install wdm (should already been installed alone with gem install jekyll)
gem install rouge (should already been installed alone with gem install jekyll)
gem install github-pages
gem install jekyll-remote-theme
```

Code Highlighting :
https://jekyllrb.com/docs/templates/#code-snippet-highlighting

```python
pip install Pygments
```
# Official Doc

https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/


# Comment by Disqus
Create a shortname:
https://disqus.com/admin/create/

_config.yml

```yml
comments:
  provider               : "disqus" # false (default), "disqus", "discourse", "facebook", "google-plus", "staticman", "staticman_v2" "custom"
  disqus:
    shortname            : "copdips" #

# Defaults
defaults:
  # _posts
  - scope:
      path: ""
      type: posts
    values:
      layout: single
      author_profile: true
      read_time: true
      comments: # true
      share: true
      related: true
```

# Configure Jekyll page

## _config.yml
global config can be accessed by variable site, for example:

`site.author.bio`


## global page layout
_layouts\single.html # layout defined by layout option in each post

Add update date:

```css
<p class="page__meta">
  {% if page.date %}
    <i class="far fa-calendar-alt" aria-hidden="true"></i> Updated: {{ page.date | date: "%B %d, %Y" }}
    &nbsp;|&nbsp;
  {% endif %}

  {% if page.read_time %}
    <i class="far fa-clock" aria-hidden="true"></i> {% include read-time.html %}
  {% endif %}
</p>
```

## per page layout
```yml
---
layout: single
title: "Setting Up Powershell Gallery And Nuget Gallery" # title shown in home page
excerpt: "As like [pypi](https://pypi.org/) for Python, [npm](https://www.npmjs.com/) for Node.js, we also have [Powershell Gallery](https://www.powershellgallery.com/) for Powershell to add some extra Powershell modules, and [Nuget Gallery](https://www.nuget.org/) for Powershell to add some extra executables." # excerpt shown in home page under title
permalink: # global permalink is set in_config.yml
tags:
  - nuget
  - powershell
  - powershell gallery
  - proxy
published: true
comments: true
author_profile: true
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
```

## Homepage
_includes\archive-single.html # defined by _layouts\home.html

## Navigation
_data\navigation.yml