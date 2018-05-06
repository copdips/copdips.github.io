{% include toc title="Table of content" %}

# Setting Up Github Pages With Custom Domain over HTTPS

> With Github pages, we can create our blogs in our own domain over HTTPS completely free (Of course you should pay for your domain name at the Registrar).

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

   <https://help.github.com/articles/setting-up-an-apex-domain/#configuring-a-records-with-your-dns-provider>

    - Add a **A** DNS record pointing **@** to **185.199.108.153**
    - Add a **A** DNS record pointing **@** to **185.199.109.153**
    - Add a **A** DNS record pointing **@** to **185.199.110.153**
    - Add a **A** DNS record pointing **@** to **185.199.111.153**

# Enable custom domain on Github.com

1. Go to github repo

   <https://github.com/githubUserName/githubUserName.github.io>

1. Add your custom domain in : Settings -> Options -> GitHub Pages -> Custom domain
   - I suggest to use `subdomain` name here instead of APEX domain name, for example: www.yourdomain.com
   - This step creates implicitly a file named **CNAME** under the root of your git repo, the content of the file CNAME is just your custom domain.
   - The commit message is 'Create CNAME'
1. Enable HTTPS is grayed out, because Github can only support HTTPS for github.io domain. We will setup the HTTPS with Cloudflare later.

# (DEPRECATED SOON) Enable HTTPS for custom domain with Cloudflare

> This solution will be `deprecated` soon as [Github supports natively HTTPS for custom domains](#Enable-HTTPS-For-Custom-Domain-With-Github) now. But Cloudflare HTTPS solution is still a very good choice if you don't use Github pages.

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

If everything goes well, you can access your custom domain by HTTPS. And if you verify the HTTPS certificate, it should be signed by COMODO, the certificate's CN is a cloudflare.com server and one of the SAN is your custom domain.

# Enable HTTPS for custom domain With Github

Github announced very recently (on May 01, 2018) [the support of HTTPS for custom domains](https://blog.github.com/2018-05-01-github-pages-custom-domains-https/), this is really a great feature. After the test, I found that the HTTPS certificate is signed by letsencrypt.org where the CN is [your github.io's CNAME](#Enable-custom-domain-on-Github.com), and everything is free. Thx Github and LetsEncrypt !
