# FutureLight HyperFrames Templates

Created: 2026-06-01 13:50:03 +08:00

This project contains the first renderable FutureLight video-template reel. It is a template suite, not a published marketing/video asset.

## Compositions

- `course-intro`: 7-second course intro using the generated color course cover and guide character.
- `word-review`: 7-second word-card practice template using the generated apple card.
- `parent-report`: 7-second weekly parent report template with privacy-first progress summary layout.
- `social-short`: 7-second shareable learning moment using the generated activity mastery badge and guide character.

The root `main` composition strings the four templates into a 28-second preview reel with transition overlays and approved WAV cues.

## Commands

```powershell
npm.cmd run check
```

```powershell
npm.cmd run render
```

## Asset Sources

The local `assets/` folder mirrors approved project assets from `../../assets` so HyperFrames preview and render can resolve them from the project root.
