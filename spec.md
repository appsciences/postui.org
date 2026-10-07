# postui.org — spec

## What this is

A static marketing/manifesto site for **postui**, a working group for moving software
from application-centric interfaces to assistant-centric ones.

Two pages, hand-written HTML with inline CSS, no build step and no dependencies:

| Path         | File                    | Purpose                            |
| ------------ | ----------------------- | ---------------------------------- |
| `/`          | `public/index.html`     | Landing page                       |
| `/manifesto` | `public/manifesto.html` | The manifesto                      |
| `/robots.txt`| `public/robots.txt`     | Crawler policy + sitemap pointer   |
| `/sitemap.xml`| `public/sitemap.xml`   | Two-URL sitemap                    |

`cleanUrls: true` in `firebase.json` is what maps `/manifesto` to `manifesto.html`,
so internal links are extensionless. `trailingSlash: false` keeps a single canonical
form per page.

## Hosting

- **Provider:** Firebase Hosting
- **Firebase project:** `postui-org` (display name `postui-org`; Google Cloud doesn't allow dots in either), owned by leopelekh@gmail.com
- **Hosting site:** `postui-org` → default domains `postui-org.web.app`, `postui-org.firebaseapp.com`
- **Custom domain:** `postui.org` (apex, primary) and `www.postui.org` (redirects to apex)
- **Registrar / DNS:** Namecheap — DNS is managed at the registrar, records point at Firebase

DNS records at Namecheap (Advanced DNS), as Firebase Hosting requires them:

| Type  | Host  | Value                                              | Purpose                          |
| ----- | ----- | -------------------------------------------------- | -------------------------------- |
| A     | `@`   | `199.36.158.100`                                   | Apex served by Firebase Hosting  |
| TXT   | `@`   | `hosting-site=postui-org`                          | Proves the domain to Firebase    |
| CNAME | `www` | `postui-org.web.app.`                              | `www` → Firebase, redirects to apex |
| TXT   | `@`   | `v=spf1 include:spf.efwd.registrar-servers.com ~all` | Namecheap email forwarding (kept) |

Both custom domains were added through the Hosting API (`customDomains`), since the
Firebase CLI has no command for it; `www.postui.org` has `redirectTarget: postui.org`.
Firebase issues the TLS certificates itself once the records resolve.

HTML and the site root are served with `Cache-Control: no-cache, max-age=0` so content
edits go live immediately rather than sitting in an intermediate cache.

## Deployment

Deploys are automated; nothing is deployed from a laptop.

| Trigger                   | Workflow                        | Result                                          |
| ------------------------- | ------------------------------- | ----------------------------------------------- |
| Push / merge to `main` or `master` | `.github/workflows/deploy.yml`  | Checks run, then deploy to the **live** channel  |
| Pull request into `main` or `master` | `.github/workflows/preview.yml` | Checks run, then a **preview channel** (7d TTL) whose URL is commented on the PR |

Both workflows authenticate with a Google service account stored as the repository
secret `FIREBASE_SERVICE_ACCOUNT_POSTUI_ORG` (`github-deploy@postui-org.iam.gserviceaccount.com`,
role `roles/firebasehosting.admin` only). The service account is scoped to Firebase
Hosting on the `postui-org` project only.

Live deploys are serialised (`concurrency: firebase-hosting-live`, `cancel-in-progress: false`)
so two merges landing close together cannot interleave and leave a half-published site.
Preview deploys for a given PR do cancel in progress, since only the newest matters.

## Checks

`scripts/check-site.mjs` runs before every deploy and blocks it on failure. It is
dependency-free and asserts:

1. `firebase.json` declares a `hosting.public` directory that exists.
2. All required files are present (`index.html`, `manifesto.html`, `robots.txt`, `sitemap.xml`).
3. Each HTML page has a non-empty `<title>`.
4. Each HTML page declares a `rel=canonical` URL on `https://postui.org`.
5. Every internal (`/`-rooted) link resolves to a real file, honouring `cleanUrls`.
6. No `localhost` / `127.0.0.1` URLs survive into published HTML.
7. Every `<loc>` in `sitemap.xml` is on the canonical origin and resolves to a real page.
8. `robots.txt` points at `https://postui.org/sitemap.xml`.

Run locally with `node scripts/check-site.mjs`.

## Adding a page

1. Add `public/<name>.html` with a `<title>` and a `rel=canonical` of `https://postui.org/<name>`.
2. Add a `<loc>` entry to `public/sitemap.xml`.
3. Add it to the `required` list in `scripts/check-site.mjs`.
4. Open a PR — the preview URL is posted as a comment; merging to `main` publishes it.
