# Lil8TD Art V1 Atlas

`lil8td-art-v1.png` is the first lightweight handcrafted pixel atlas used by the browser renderer.
It intentionally stays tiny and static: no build step is required for GitHub Pages.

Source/rebuild helper: `scripts/generate-art-v1.py`.

Sprite families currently present:

- 4 grass terrain variants
- 4 packed-road/path variants
- 3 tower identity sprites: arrow, burst, frost
- 3 enemy identity sprites: grunt, runner, brute
- 1 UI corner ornament piece

This is not final art. It is the first asset-foundation pass: enough real sprite material to move the demo away from pure procedural canvas drawing while preserving deterministic gameplay and lightweight deploy.
