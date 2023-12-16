---
authors:
- copdips
categories:
- web
- migration
- jekyll
- mkdocs
comments: true
date:
  created: 2023-12-16
description: ''
---

# Migrating my blog from Jekyll Minimal Mistakes to Mkdocs Material

After using [Jekyll Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) for years, I decided to migrate [my blog](https://copdips.com) to [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), as it's written in Python and I'm more familiar with it.

<!-- more -->

I am very grateful to the [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) maintainers for giving me [some valuable tips](https://github.com/squidfunk/mkdocs-material/discussions/6430#discussioncomment-7753446) for the migration kickoff.

## Create blog folder

I needed a pure blog without documentation, so I need the URL to be `https://copdips.com/`, instead of `https://copdips.com/blog/` to be compatible with Jekyll blog URL format. To do this, I followed [this documentation](https://squidfunk.github.io/mkdocs-material/setup/setting-up-a-blog/?h=authors+yml#blog-only).

## Creating .authors.yml

I created an authors file at `./docs/authors.yml`. See [this doc](https://squidfunk.github.io/mkdocs-material/setup/setting-up-a-blog/?h=authors+yml#adding-authors) for more details.

## Copying all posts and converting the YAML metadata

I used this [Python script](https://github.com/copdips/copdips.github.io/blob/main/scripts/jekyll_to_mkdocs/convert_yaml_metadata.py) to copy all the posts from `./_posts` to `./docs/posts/`, and converted the YAML metadata from the Jekyll format to the Mkdocs Material format.

## Converting admonition

The two blog engines use different admonition syntax. See [this doc](https://squidfunk.github.io/mkdocs-material/reference/admonitions/?h=admonition#syntax) for more details.

I used this [Python script](https://github.com/copdips/copdips.github.io/blob/main/scripts/jekyll_to_mkdocs/convert_admonition.py) to convert the format.

## Fixing headers and excerpt

In the old blog, for some posts, I used `#` for all first-level headers, but in Mkdocs-Material, `#` is reserved for page title, so I needed to change all the headers to `##`, and also convert previous `##` to `###`, and so on. And for the comment symbol `#` in the code blocks, I need to skipped it.

For excerpt, many of my Jekyll posts have already excerpt right after the YAML metadata and start by `>`, like `> excerpt text from here`. But in Mkdocs Material, I needed to use `<!-- more -->`. I referred to [this documentation](https://squidfunk.github.io/mkdocs-material/setup/setting-up-a-blog/?h=excerpt#adding-an-excerpt) for more details. And I chose not to set excerpt from the `excerpt` within the old posts YAML metadata, there was no special reason, but it might be useful for some other people.

For example, I needed to convert following markdown:

  ```markdown
    # title

    > excerpt text from here.

    Another text.

    # chapter 1

    ```py
    # this is a comment
    ...
    ```

    ## section 1

    # chapter 2

    ## section 1
  ```

to:

  ```markdown
    # title

    excerpt text from here.

    <!-- more -->

    Another text.

    ## chapter 1

    ```py
    # this is a comment
    ...
    ```

    ### section 1

    ## chapter 2

    ### section 1
  ```

I used this [Python script](https://github.com/copdips/copdips.github.io/blob/main/scripts/fix_headers.py) to fix the headers.

Some posts in the old blog didn't have an excerpt, so I had to add `<!-- more -->` manually.

## Fixing multiple blank lines

After the above steps, there were sometimes multiple continuous blank lines in the markdown files, I used this [Python script](https://github.com/copdips/copdips.github.io/blob/main/scripts/fix_multiple_blank_lines.py) to ensure there's only one blank line each time.

## Post URL

### Hyphen `-` in title

Mkdocs Material computes post url slug by keeping hyphen `-`, while Jekyll discards it. So given title `Github - Test`, Jekyll will generate `github-test`, while Mkdocs-Material will generate `github---test`. To keep the url the same after the migration, the workaround was to change the title to `Github: Test`.

I used the VSCode find/replace feature with following regex:

```yaml
Source: "^(#[^#].*?) - (.*?)"
Replace: "$1: $2"
Files to include: "./docs/posts"
```

### Ending with `.html`

Jekyll generates post URLs ending with `.html`, while Mkdocs-Material doesn't by default. To keep the url the same after the migration, I checked this [tip](https://github.com/squidfunk/mkdocs-material/discussions/6430#discussioncomment-7753446) by disabling the `use_directory_urls` option in mkdocs.yml.

### Removing word blog from url

By default, Mkdocs-Material adds the word `blog` in the URL path, but I didn't want it. To remove it, I checked this [tip](https://github.com/squidfunk/mkdocs-material/discussions/6430#discussioncomment-7753446).

## Image path

I used VSCode find/replace feature to replace all the image paths.

## Code action view Source

Code action view Source is bound to `master` branch by default, not `main` branch. To use `main` branch, I added `edit_uri: edit/main/docs/` to `mkdocs.yml`. See [this doc](https://squidfunk.github.io/mkdocs-material/setup/adding-a-git-repository/?h=content+action#code-actions)

## Deploying to GitHub Pages

Jekyll uses `gh-pages` branch to publish blog, but I used GitHub actions within Mkdocs, so I didn't need to use `gh-pages` branch. To use GitHub actions, I went to my repository at https://github.com/copdips/copdips.github.io/, entered `Settings` -> `Pages`, and set Github Actions as `Source`.

My GitHub Actions for blog publishing can be found [here](https://github.com/copdips/copdips.github.io/blob/main/.github/workflows/build_and_deploy.yml).
