---
title: "Setup HTTPS for Gitlab"
excerpt: "Setup a SAN SSL certificate to use the HTTPS on Gitlab-CE in docker on Ubuntu server."
tags:
  - gitlab
  - cicd
  - certificate
  - openssl
  - ubuntu
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

> Gitlab-CE default installation goes with HTTPS disable. We need to generate a SSL certificate, and bind it to the HTTPS of Gitlab-CE.

# Some docs on the Internet

1. [Gitlab omnibus SSL settings](https://docs.gitlab.com/omnibus/settings/ssl.html)
2. [Gitlab omnibus enable HTTPS](https://docs.gitlab.com/omnibus/settings/nginx.html#enable-https)
3. [Generate a self-signed certificate with openssl](https://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl)
4. [How to install and configure Gitlab on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-gitlab-on-ubuntu-16-04)
5. [[Deprecated] How To Secure GitLab with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-gitlab-with-let-s-encrypt-on-ubuntu-16-04)

# Generate self-signed SSL certificate without SAN

## Online docs for SSL certificate without SAN

1. [Creating a Self-Signed SSL Certificate](https://devcenter.heroku.com/articles/ssl-certificate-self)
2. [How To Run Gitlab With Self Signed Ssl Certificate](https://futurestud.io/tutorials/how-to-run-gitlab-with-self-signed-ssl-certificate)

## Generate SSL certificate private key

```bash
xiang@ubuntu1804:~/ssl$ sudo openssl genrsa -out "./gitlab.copdips.local.key" 2048
Generating RSA private key, 2048 bit long modulus
............+++
..+++
e is 65537 (0x010001)
```

## Generate SSL certificate request

Without the switch `-config`, the generation of csr request will ask you some information about company, email, and passphrasem etc. If you dont want OpenSSL to ask you that, you need to prepare a config file and specify it by `-config [YourConfigPath]`, and config example can be found in the paragraph [Prepare the OpenSSL config file](#prepare-the-openssl-config-file).

```bash
xiang@ubuntu1804:~/ssl$ sudo openssl req -new -key "gitlab.copdips.local.key" -out "gitlab.copdips.local.csr"
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:copdips
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:gitlab.copdips.local
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```

## Generate SSL certificate

OpenSSL has the option to generate the certificate in one line, this post splits it into 3 steps (the private key, the request file, and the certificate) in order to get a clear understanding of the certificate generation procedure.

```bash
xiang@ubuntu1804:~/ssl$ sudo openssl x509 -req -days 1000 -in gitlab.copdips.local.csr -signkey gitlab.copdips.local.key -out gitlab.copdips.local.crt -extfile gitlab.copdips.local.cnf -extension v3_req
Signature ok
subject=C = AU, ST = Some-State, O = copdips, CN = gitlab.copdips.local
Getting Private key
```

## Review the SSL certificate content

```bash
xiang@ubuntu1804:~/ssl$ openssl x509 -in gitlab.copdips.local.crt -text -noout
Certificate:
    Data:
        Version: 1 (0x0)
        Serial Number:
            b4:96:ba:89:62:7b:32:83
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = AU, ST = Some-State, O = copdips, CN = gitlab.copdips.local
        Validity
            Not Before: Sep 13 22:05:40 2018 GMT
            Not After : Jun  9 22:05:40 2021 GMT
        Subject: C = AU, ST = Some-State, O = copdips, CN = gitlab.copdips.local
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
```

**DO NOT** use password protected certificate key (in case the lack of the switch -nodes for *no DES*), to [remove the password from the key](https://docs.gitlab.com/omnibus/settings/nginx.html#manually-configuring-https):
`openssl rsa -in certificate_before.key -out certificate_after.key`
{: .notice--warning}

# Generate self-signed SAN SSL certificate

## Online docs for SSL certificate with SAN

I tested many methods found on the Internet, most of them don't work. Finally, I followed the [doc maintained by Citrix](https://support.citrix.com/article/CTX135602). This should be a trusted one as Netscaler is a key product in Citrix, the doc is always updated with the latest version of OpenSSL.
With time going by, the procedure might change, if below procedure doesn't work, please go to check the Citrix online doc directly.

## Prepare the OpenSSL config file

Prepare an OpenSSL config file. On Ubuntu 1804, an OpenSSL config example can be found at: `/usr/lib/ssl/openssl.cnf`.
Or You can find the path from the command: `openssl version -a | grep OPENSSLDIR`. You might need to change the config according to your actual environment.

```bash
xiang@ubuntu1804:~/ssl$ cat gitlab.copdips.local.cnf
[req]
prompt             = no
default_bits       = 2048
x509_extensions    = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]
organizationName        = copdips
commonName              = gitlab.copdips.local

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.copdips.local
DNS.2 = ubuntu1804
DNS.3 = ubuntu1804.copdips.local
```

Be careful with the usage of the `wildcard` in [alt_names], the above OpenSSL config is just an example to show what are the DNS names can be added to SAN.
{: .notice--warning}

## Generate the SAN SSL certificate content

Pay attention to `-extensions v3_req` in the end of the command, it's the extension tag name in the `gitlab.copdips.local.cnf` file. If you dont specify it, the output certificate won't have the extension part, so no SAN neither.

```bash
xiang@ubuntu1804:~/ssl$ sudo openssl req -x509 -days 1000 -nodes -out gitlab.copdips.local.crt -keyout gitlab.copdips.local.key -config gitlab.copdips.local.cnf -extensions v3_req
Generating a 2048 bit RSA private key
...................................................+++
...............................+++
writing new private key to 'gitlab.copdips.local.key'
```

**DO NOT** use password protected certificate key (in case the lack of the switch -nodes for *no DES*), to [remove the password from the key](https://docs.gitlab.com/omnibus/settings/nginx.html#manually-configuring-https):
`openssl rsa -in certificate_before.key -out certificate_after.key`
{: .notice--warning}

## Review the SAN SSL certificate

The `default Signature Algorithm` has been already `SHA256`. Some online docs tell to add the switch -sha256 when using openssl req, but it's deprecated with the new version of OpenSSL. BTW, the `RSA private key default bits` is `2048`. My OpenSSL version on Ubuntu 1804 is `OpenSSL 1.1.0g  2 Nov 2017`

```bash
xiang@ubuntu1804:~/ssl$ openssl x509 -in gitlab.copdips.local.crt -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            d3:2c:bb:1d:6c:7e:7b:98
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: O = copdips, CN = gitlab.copdips.local
        Validity
            Not Before: Sep 15 22:00:55 2018 GMT
            Not After : Jun 11 22:00:55 2021 GMT
        Subject: O = copdips, CN = gitlab.copdips.local
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    [...]
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:*.copdips.local, DNS:ubuntu1804, DNS:ubuntu1804.copdips.local
    Signature Algorithm: sha256WithRSAEncryption
         [...]
```

# Save the SSL certificate

Create the folder `/etc/gitlab/ssl` with following two commands, and copy the SSL certificate and key here with the name of `[fqdn].crt` and `[fqnd].key`.

```bash
root@gitlab:/# mkdir -p /etc/gitlab/ssl
root@gitlab:/# chmod 700 /etc/gitlab/ssl
xiang@ubuntu1804:~/ssl$ sudo cp ~/ssl/gitlab.copdips.local.key ~/ssl/gitlab.copdips.local.crt /srv/gitlab1083/config/ssl/
```

`/srv/gitlab1083/ssl/` is the physical gitlab location  on my Ubuntu server which is pointed to `/etc/gitlab/ssl` its docker container.
{: .notice--info}

# Configure HTTPS on Gitlab

Hereunder the content of uncommented lines in the Gitlab configuration file:

```bash
root@gitlab:/# grep "^[^#;]" /etc/gitlab/gitlab.rb
 external_url 'https://gitlab.copdips.local'
 nginx['redirect_http_to_https'] = true
 nginx['ssl_certificate'] = "/etc/gitlab/ssl/gitlab.copdips.local.crt"
 nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/gitlab.copdips.local.key"
```

# Update Gitlab config

When you changed the configuration file, to take effect:

```bash
root@gitlab:/# gitlab-ctl reconfigure
```

# Check the website SSL certificate from the command line

## By openssl for both Linux and Windows

For Linux :
```bash
openssl s_client -connect gitlab.copdips.local:443 < /dev/null 2>/dev/null | openssl x509 -text -in /dev/stdin -noout
```

For Windows with OpenSSL installed:
```powershell
$null | openssl s_client -connect gitlab.copdips.local:443 | openssl x509 -text -noout
```

My OpenSSL is installed with GIT on Windows. [GitForWindows](https://gitforwindows.org/) installs also many other powerful Linux commands (grep, ssh, tail, and also vim, etc.) ported to Windows.
{: .notice--info}

## By certuil for Windows only

You should explicitly download the certificate at first, and then view the content locally, so this method is not cool.
Hope Powershell team can get this done by one single cmdlet in the future Powershell releases.

```powershell
$url = "https://gitlab.copdips.local"
$localCertPath = "$env:temp\$($url.Split('/')[2]).crt"
$webRequest = [Net.WebRequest]::Create($url)
try { $webRequest.GetResponse() } catch {} # try catch is useful if ssl cert is not valid. ServicePoint is always kept even for invalid ssl cert.
$cert = $webRequest.ServicePoint.Certificate
$bytes = $cert.Export("Cert")
Set-content -value $bytes -encoding byte -path $localCertPath
certutil.exe -dump $localCertPath
```

Or a nice cmdlet [`Test-WebServerSSL`](https://www.sysadmins.lv/blog-en/test-remote-web-server-ssl-certificate.aspx) written by the MVP Vadims Podāns.

# Update the certificate in case of renewal

Here is the [official doc](https://docs.gitlab.com/omnibus/settings/nginx.html#update-the-ssl-certificates).

When you changed the SSL certificate, `gitlab-ctl reconfigure` won't take it into effect as there's nothing changed in the gitlab.rb configuration file. Use following command to update the certificate:

```bash
gitlab-ctl hup nginx
```
