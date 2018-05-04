{% include toc title="Table of content" %}
# Create Github Page on Github.com

1. On Github create a repo with name : githubUserName.github.io
2. Push a file `index.html` to branch `master` or `gh-pages`
3. Now you can access your github page by going to githubUserName.github.io

   From now on, you've created a fully operational blog on http://githubUserName.github.io, you can also enable HTTPS on it by going to the repo's settings menu, everthing is free.

   If you dont need to use a custom domain like http://yourname.com, you can stop here, but if you want it, please go ahead.

# Setup custom domain

## Register a custom domain

Register a custom domain on your preferred domain name registrar

## Setup DNS on your DNS registrar

### Add subdomain

<https://help.github.com/articles/setting-up-a-www-subdomain/>

- Add a **CNAME** type DNS entry pointing **www** to **copdips.github.io**
- Add a **CNAME** type DNS entry pointing **blog** to **copdips.github.io**

### Add APEX domain

<https://help.github.com/articles/setting-up-an-apex-domain/#configuring-a-records-with-your-dns-provider>

- Add a **A** type DNS entry pointing **@** to **192.30.252.153**
- Add a **A** type DNS entry pointing **@** to **192.30.252.154**

## Enable custom domain on Github.com

1. Go to github repo

   <https://github.com/githubUserName/githubUserName.github.io>

1. Add your custom domain in : Settings -> Options -> GitHub Pages -> Custom domain
   - This step creates implicitly a file named **CNAME** under the root of your git repo, the content of the file CNAME is just your custom domain.
   - The commit message is 'Create CNAME'
1. Enable HTTPS is grayed out, because Github can only support HTTPS for github.io domain. We will setup the HTTPS with Cloudflare later.

# Enable HTTPS for custom domain with Cloudflare

  Some tutorials :
  [tutorial 1](https://hackernoon.com/set-up-ssl-on-github-pages-with-custom-domains-for-free-a576bdf51bc)
  ,
  [tutorial 2](https://www.jonathan-petitcolas.com/2017/01/13/using-https-with-custom-domain-name-on-github-pages.html)

  Simplified steps :

  1. Sign up for a free Cloudflare Account
  1. Follow the wizard, give your custom domain, Cloudflare should find all your CNAME and A entries.
  1. Cloudflare should ask you to change your custom domain's default DNS servers given by your DNS registrar to the Cloudflare ones.
     - The change may take several hours to take effect
     - Cloudflare DNS example: vida.ns.cloudflare.com, zod.ns.cloudflare.com
  1. Go to `Crypto` tab, verify SSL is set to Full
  1. Go to `Page Rules` tab, add a page rule : http://*customdomain.com/* with `Always Use HTTPS`