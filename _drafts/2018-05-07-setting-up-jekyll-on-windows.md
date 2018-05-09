{% include toc title="Table of content" %}

https://github.com/juthilo/run-jekyll-on-windows/

https://rubyinstaller.org/downloads/
Install Ruby + Devkit

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
gem install wdm (should already been installed alone with gem install jekyll)
gem install rouge (should already been installed alone with gem install jekyll)
gem install github-pages
gem install jekyll-remote-theme
```

```python
pip install Pygments
```

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
