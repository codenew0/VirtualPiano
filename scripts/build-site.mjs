import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/js", { recursive: true });

await Promise.all([
  cp("index.html", "dist/index.html"),
  cp("LICENSE", "dist/LICENSE"),
  cp("css", "dist/css", { recursive: true }),
  cp("js/worklets", "dist/js/worklets", { recursive: true }),
  ...[
    "app.js",
    "audio.js",
    "instruments.js",
    "interaction.js",
    "music.js",
    "piano-ui.js",
    "range-controls.js",
  ].map((file) => cp(`js/${file}`, `dist/js/${file}`)),
]);
