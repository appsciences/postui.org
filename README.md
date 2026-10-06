# postui.org

Static site for [postui.org](https://postui.org) — a working group for moving software
from application-centric interfaces to assistant-centric ones.

Hand-written HTML, no build step, no dependencies.

## Local development

Serve the site exactly as Firebase Hosting will (respects `cleanUrls`, headers, redirects):

```
firebase emulators:start --only hosting
```

Run the pre-deploy checks:

```
node scripts/check-site.mjs
```

## Deploying

Don't deploy by hand. Open a PR into `main`:

- **PR opened** → checks run, a preview channel is deployed and its URL is commented on the PR.
- **Merged to `main`** → checks run, the site deploys to the live channel at https://postui.org.

See [spec.md](spec.md) for the hosting, DNS and CI details.
