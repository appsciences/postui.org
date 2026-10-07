# PostUI artifact changelog

The artifact is versioned on its own; bump `ARTIFACT_VERSION` in `postui.html` and
add an entry here on every publish (docs/spec.md, Build brief conventions).

## 0.1.0

First version (issue #2): the v1 UI against demo data.

- Nine views: Feed, Thread (`#t-<id>`), Needs, Builds, Pilots, Canon, Profile (`#u-<handle>`), Inbox, Moderation.
- The data layer is named after the connector's tools. It uses demo fixtures until a `PostUI` connector is reachable through `mcp`.
- First-run panel explaining how to connect; designed loading, empty and error states.
- Member content renders as sanitized markdown built with DOM nodes. The page never assigns HTML strings.
- AI helpers on the viewer's own Claude: Need coach, thread summary, Ask PostUI. They're hidden when `sample` is unavailable.
- Rebuild with my Claude (copy prompt), Remix, Export bundle (`downloads`), Try-it reports, static source scan.
- Live previews off until spike S4 passes.
- Runtime contract pinned to 0.2.72. Declares `sample` and `downloads`; `mcp` is added once the connector exists.
