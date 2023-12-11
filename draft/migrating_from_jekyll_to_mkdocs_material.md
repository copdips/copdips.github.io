# Migrating from Jekyll to Mkdocs-Material

## Post URL

Mkdocs-Material compute post url slug by keeping hyphen `-`, while Jekyll discards it. So given title `Github - Test`. Jekyll will generate `github-test`, while Mkdocs-Material will generate `github---test`.

VSCode replace:
:rocket:
Source: `^(#[^#].*?) - (.*?)`
Replace: `$1: $2`
Files to include: `./docs/posts`

## Image path

Use VSCode replace

## View Source

URL bound to `master` branch, not `main` branch.
