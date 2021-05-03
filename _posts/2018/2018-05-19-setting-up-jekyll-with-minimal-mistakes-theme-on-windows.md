---
title: "Setting up Jekyll with Minimal Mistakes theme on Windows"
excerpt: "Preview Jekyll blog locally on Windows with the Minimal Mistakes theme."
tags:
  - jekyll
  - web
  - windows
  - ruby
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

> Do you want to preview Jekyll blog locally on Windows before publishing it to Internet? Many online tutorials about setting up Jekyll on Windows are out of date, I will show you in this post the 2018 version and with the Minimal Mistakes theme.

# Some online tutorials

- <https://jekyllrb.com/docs/home/>
- <https://help.github.com/articles/using-jekyll-as-a-static-site-generator-with-github-pages/>
- <https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/>

# Install Ruby and Devkit on Windows

Jekyll is writted in Ruby, to preview Jekyll blog content, we need to install Ruby and Ruby DevKit.

> Which Development Kit?
>
>  rubyinstaller.org: Starting with Ruby 2.4.0 we use the MSYS2 toolchain as our development kit. When using the Ruby+Devkit installer version, it is a selectable component, so that no additional downloads/installs are required.
>
>  When using the Ruby without Devkit version, the MSYS2 Devkit can be installed separately by running ridk install. MSYS2 is required to build native C/C++ extensions for Ruby and is necessary for Ruby on Rails. Moreover it allows the download and usage of hundreds of Open Source libraries which Ruby gems can depend on.

Download and install the **Ruby+DevKit** from the **with Devkit** part of the following downloads page:
<https://rubyinstaller.org/downloads/>


# Install Jekyll Ruby package and its dependencies

Ruby uses [gem](https://rubygems.org/) to install the Ruby packages.

Change gem source if default <https://rubygems.org/> banned in China:
```ruby
gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
```

To install the basic Jekyll environment, open a Powershell console:
```ruby
> gem install bundler
> gem install jekyll
...
Done installing documentation for public_suffix, addressable, colorator, http_parser.rb, eventmachine, em-websocket, concurrent-ruby, i18n, rb-fsevent, ffi, rb-inotify, sass-listen, sass, jekyll-sass-converter, ruby_dep, listen, jekyll-watch, kramdown, liquid, mercenary, forwardable-extended, pathutil, rouge, safe_yaml, jekyll after 55 seconds
25 gems installed
```

# Choose a theme

Googling will give you many Jekyll theme, this blog is using the [**minimal-mistakes theme**](https://mmistakes.github.io/minimal-mistakes/about/),

By using the procedure provided by the [quick start guide](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/) of the minimal mistakes theme, we can install all the Jekyll dependencies

# Customize the theme

## The _config.yml file

All the global configurations are set here, this is your starting point

## Add Disqus comment system

1. Create an account on <https://disqus.com/>
2. Create a shortname on : <https://disqus.com/admin/create/>
3. Edit file `_config.yml`

```yml
comments:
  provider               : "disqus" # false (default), "disqus", "discourse", "facebook", "google-plus", "staticman", "staticman_v2" "custom"
  disqus:
    shortname            : "the shortname created in step 2"
```

If you want to enable comment system by default on all the blog posts, set `comments` in defaults part of _config.yml to `true` :
```yml
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
      comments: true
      share: true
      related: true
```

## Default page layout

In _config.yml, I chose `single` as my post default layout style.

The layout can be found at : `_layouts\single.html`

### Add update date in each post under the post title



## Per page layout

On the top of the post, you can add your [YAML Front Matter](https://jekyllrb.com/docs/frontmatter/):
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

The homepage is defined by :  `_layouts\home.html`, and it uses `_includes\archive-single.html` as its default content

## Navigation

To customize the navigation bar on top of the blog: `_data\navigation.yml`, for example, I added the `Home` menu :

```yml
# main links
main:
  # - title: "Quick-Start Guide"
  #   url: https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/
  # - title: "About"
  #   url: https://mmistakes.github.io/minimal-mistakes/about/
  # - title: "Sample Posts"
  #   url: /year-archive/
  # - title: "Sample Collections"
  #   url: /collection-archive/
  # - title: "Sitemap"
  #   url: /sitemap/
  - title: "Home"
    url: /
```

The `Search` menu in the navigation bar is set by the `search` option in the global `_config.yml` file, the default value is false which disables the Search menu :

```yml
search                   : true # true, false (default)
```

## Add notice (Primary, Info, Success, Warning, Danger)

Append a new line under the text bloc, and insert the notice tag there :
- <https://mmistakes.github.io/minimal-mistakes/docs/utility-classes/#notices>

Other external notice methods :
- <https://idratherbewriting.com/documentation-theme-jekyll/mydoc_alerts.html>
- <https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/#colorful-sections>

# Write a post

All Jekyll posts should be written in [markdown .md](https://en.wikipedia.org/wiki/Markdown) or HTML formats, and Jekyll uses Ruby's [Kramdown](https://kramdown.gettalong.org/) as its default markdown converter.

> You can also use other formats for post files, but you should provide the corresponding convertor. If you want to host your Jekyll blog on the Github Pages, it is suggested to use Kramdown because Github Pages has its own white list of the Jekyll plugins, your convertor plugin might not be available on Github Pages, so your post won't be displayed correctly as expected.

All post files should be put into the `_posts` folder, Jekyll requires blog post files to be named according to the following format:
```
YEAR-MONTH-DAY-title.MARKUP

# examples:
2011-12-31-new-years-eve-is-awesome.md
2012-09-12-how-to-write-a-blog.md
```

You don't need to put all the files under the root of _posts folder, you can also use year and month as the sub folder name :

```powershell
> tree ./_posts /f

D:\XIANG\GIT\COPDIPS.GITHUB.IO\_POSTS
└─2018
        2018-05-03-setting-up-github-pages-with-custom-domain-over-https.md
        2018-05-07-setting-up-powershell-gallery-and-nuget-gallery-for-powershell.md
        2018-05-16-powershell-stop-parsing.md
```

# Write a draft

Jekyll draft files should be saved into `_drafts` folder. The files in this folder won't be displayed.

# Define the post url

The default post URL is https://yourdomain/post-name

If you want to custom it, edit `permalink` in the `_config.xml` file, I'm using the following format :

```yml
permalink: /:year/:month/:title.html
```

# Change the post skin look

The Jekyll post is using the Minimal Mistake theme, so the post skin is defined by the `minimal_mistakes_skin` option in `_config.yml` file.

All skin look related files can be found in `_sass` folder, for example :

- _air.scss (This blog is using air skin)
- _base.scss
- _footer.scss
- _sidebar.scss
- etc.

# Preview the blog locally on Windows

From Powershell console :

```powershell
> bundle exec jekyll serve -w

Configuration file: D:/xiang/git/copdips.github.io/_config.yml
            Source: D:/xiang/git/copdips.github.io
       Destination: D:/xiang/git/copdips.github.io/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 6.534 seconds.
  Please add the following to your Gemfile to avoid polling for changes:
    gem 'wdm', '>= 0.1.0' if Gem.win_platform?
 Auto-regeneration: enabled for 'D:/xiang/git/copdips.github.io'
    Server address: http://127.0.0.1:4000
  Server running... press ctrl-c to stop.
```

The outputs tell that you can visit your site from : [http://127.0.0.1:4000](http://127.0.0.1:4000)

Except you modify the `_config.yml` file, all the other modifications can trigger automatically the regeneration of the blog pages, and just refresh your blog page from the navigator, you can read the new version right away. But any modification in _config.yml needs the relaunch of `bundle exec jekyll serve -w` command to see the result.
