---
title: "Setting up Github Pages With custom domain over HTTPS"
excerpt: "With Github pages, we can create our blogs in our own domain over HTTPS completely free. Of course you should pay for your domain name at the Registrar."
tags:
  - github
  - github-pages
  - web
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

{% include toc title="Table of content" %}

> With Github pages, we can create our blogs in our own domain over HTTPS completely free. Of course you should pay for your domain name at the Registrar.

# Create Github pages on Github.com

1. On Github create a repo with name : githubUserName.github.io
2. Push a file `index.html` to branch `master` or `gh-pages`
3. Now you can access your github page by going to githubUserName.github.io

From now on, you've created a fully operational blog on http://githubUserName.github.io, you can also enable HTTPS on it by going to the repo's settings menu, everything is free.

If you dont need to use a custom domain like http://yourname.com, you can stop here, but if you want it, please go ahead.

# Register a custom domain

Register a custom domain on your preferred domain name registrar

# Setup DNS on DNS registrar

1. Add subdomain

   <https://help.github.com/articles/setting-up-a-www-subdomain/>

   - Add a **CNAME** DNS record pointing **www** to **copdips.github.io**
   - Add a **CNAME** DNS record pointing **blog** to **copdips.github.io**

1. Add APEX domain

   My DNS registrar doesn't support [ALIAS nor ANAME](https://help.github.com/articles/setting-up-an-apex-domain/#configuring-an-alias-or-aname-record-with-your-dns-provider), I should go with the [A records](https://help.github.com/articles/setting-up-an-apex-domain/#configuring-a-records-with-your-dns-provider) :

    - Add a **A** DNS record pointing **@** to **185.199.108.153**
    - Add a **A** DNS record pointing **@** to **185.199.109.153**
    - Add a **A** DNS record pointing **@** to **185.199.110.153**
    - Add a **A** DNS record pointing **@** to **185.199.111.153**

# Enable custom domain on Github.com

1. Go to github repo

   <https://github.com/githubUserName/githubUserName.github.io>

1. Add your custom domain in : Settings -> Options -> GitHub Pages -> Custom domain
   - If you'll just run a blog on your domain, I suggest to use [`APEX domain`](https://help.github.com/articles/setting-up-an-apex-domain-and-www-subdomain/) name here instead of subdomain, for example: yourdomain.com
   - This step creates implicitly a file named **CNAME** under the root of your git repo, the content of the file CNAME is just your custom domain.
   - The commit message is 'Create CNAME'
1. On the same page, the option `Enable HTTPS` serves to redirect HTTP traffic to HTTPS. The option is grayed out for the moment,  because initially https://yourdomain.github.io is binded with a github's certificate so as to https://youdomain.com. In order to  secure correctly your new site https://youdomain.com, Github needs to ask [LetsEncrypt](letsencrypt.org) to issue a new certificate where the [CN](https://en.wikipedia.org/wiki/Certificate_signing_request) is youdomain.com, than when people visit your web site, they will see [a green padlock](https://support.mozilla.org/en-US/kb/how-do-i-tell-if-my-connection-is-secure) in the address bar. The generation of LetsEncryt certificate takes usually  1 or 2 days, be patient, once you see a green lock when you open https://youdomain.com, you can come back here and enable the option `Enable HTTPS`.

# Enable HTTPS for custom domain with Cloudflare

> This solution is `partially deprecated` as [Github supports natively HTTPS for custom domains](#enable-https-for-custom-domain-with-github) now, but Github pages doesn't provide the wildcard certificate yet. For a better compatibility, Cloudflare HTTPS solution is still one of the best choices.

Some tutorials :
[tutorial 1](https://hackernoon.com/set-up-ssl-on-github-pages-with-custom-domains-for-free-a576bdf51bc)
,
[tutorial 2](https://www.jonathan-petitcolas.com/2017/01/13/using-https-with-custom-domain-name-on-github-pages.html)

Simplified steps :

1. Sign up for a free Cloudflare Account
1. Follow the wizard, give your custom domain, Cloudflare should find all your CNAME and A records.
1. Cloudflare should ask you to change your custom domain's default DNS servers given by your DNS registrar to the Cloudflare ones.
    - The change may take several hours to take effect
    - Cloudflare DNS example: vida.ns.cloudflare.com, zod.ns.cloudflare.com
1. Go to `Crypto` tab, verify SSL is set to Full
1. Go to `Page Rules` tab, add a page rule : http://*customdomain.com/* with `Always Use HTTPS`

If everything goes well, you can access your custom domain by HTTPS. And if you verify the HTTPS certificate, it should be signed by COMODO, the certificate's CN is a cloudflare.com server and one of the SAN is your custom domain.

# Enable HTTPS for custom domain With Github

Github announced very recently (on May 01, 2018) [the support of HTTPS for custom domains](https://blog.github.com/2018-05-01-github-pages-custom-domains-https/), this is really a great feature. After the test, I found that the HTTPS certificate is signed by letsencrypt.org where the CN is [your github.io's CNAME](#enable-custom-domain-on-githubcom), and everything is free. Thx Github and LetsEncrypt !

You can also enable the HTTP to HTTPS automatic redirection from here.

If you use subdomain (for ex: www.copdips.com), hereunder the HTTPS tests :

- typed http://copdips.com, redirected to https://www.copdips.com
- typed http://www.copdips.com, redirected to https://www.copdips.com
- typed https://copdips.com, redirected to the same https://copdips.com with a certificate error, as LetsEncrypt only signed to www.copdips.com in the CN.

  > With [Cloudflare's HTTPS solution](#enable-https-for-custom-domain-with-cloudflare), there's no such error, as Cloudflare signed a wildcard certificate to *.copdips.com in the SAN.

If you use APEX domain (for ex: copdips.com), hereunder the HTTPS tests :
- typed http://copdips.com, redirected to https://copdips.com
- typed http://www.copdips.com, redirected to https://copdips.com
- typed https://copdips.com, redirected https://copdips.com
- typed https://www.copdips.com, redirected to https://copdips.com

  > With APEX domain, everything is good on HTTPS with native Github solution, you dont need Cloudflare

