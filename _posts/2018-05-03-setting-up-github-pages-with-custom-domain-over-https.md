{% include toc title="Table of content" %}
# Create Github Page on Github.com

1. On Github create a repo with name : githubUserName.github.io
2. Push a file `index.html` to branch `master` or `gh-pages`
3. Now you can access your github page by going to githubUserName.github.io

# Setup custom domain

## Register a custon domain

Register a custon domain on your preferred domain name registrar

## Setup DNS on your DNS registrar

### Add subdomain

<https://help.github.com/articles/setting-up-a-www-subdomain/>

- Add CNAME **www** to copdips.github.io
- Add CNAME **blog** to copdips.github.io

### Add APEX domain

<https://help.github.com/articles/setting-up-an-apex-domain/#configuring-a-records-with-your-dns-provider>

- Add A @ to **192.30.252.153**
- Add A @ to **192.30.252.154**

## Enbale custom domain on Github.com

1. Go to github repo

   <https://github.com/githubUserName/githubUserName.github.io>

1. Add your custom domain in : Settings -> Options -> GitHub Pages -> Custom domain
   - This step implictly creates a file name CNMAE under the root of your repo, the content of the file CNAME is just your custom domain.
   - The commit message is 'Create CNAME'
1. Enable HTTPS is grayed out, because Github can only support HTTPS for github.io domain. We will setup the HTTPS with Cloudflare later.

# Enable HTTPS for custom domain with Cloudflare

  Some tutos :
  [tuto 1](https://hackernoon.com/set-up-ssl-on-github-pages-with-custom-domains-for-free-a576bdf51bc)
  ,
  [tuto 2](https://www.jonathan-petitcolas.com/2017/01/13/using-https-with-custom-domain-name-on-github-pages.html)

  Simplified steps :

  1. Set Up and create a free Cloudflare Account
  1. Follow the wizard, give your custom domain, CLoudflare should find all your CNAME and A entries.
  1. Cloudflare should ask you to change your custom domain' DNS servers on your DNS registrar to Cloudflare ones.
     - The change may take several hours to take effect
     - Cloudflare DNS example: vida.ns.cloudflare.com, zod.ns.cloudflare.com
  1. Go to `Crypto` tab, verify SSL is set to Full
  1. Go to `Page Rules` tab, add a page rule : http://*customdomain.com/* with `Always Use HTTPS`