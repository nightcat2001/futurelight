# FutureLight HTML Prototype

This prototype replaces the stopped Figma workflow with a local, inspectable HTML review surface.

Open `index.html` in a browser or serve the `prototype` folder with any static server.

Included:

- 12 core product screens for a 0-6 child story and parent-guided learning product
- Page Index
- User Flow Index
- Android, H5, and tablet preview modes
- QA Panel with goal, CTA, accessibility, child safety, animation, and traceability evidence
- State controls for default, loading, empty, error, success, offline, disabled, and permission denied
- HTML Prototype Gate at `tests/html-prototype-gate.mjs`

Validation command:

```bash
node prototype/tests/html-prototype-gate.mjs
```
