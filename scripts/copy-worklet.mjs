import { copyFile, mkdir } from "node:fs/promises";

await mkdir("js/worklets", { recursive: true });
await copyFile(
  "node_modules/spessasynth_lib/dist/spessasynth_processor.min.js",
  "js/worklets/spessasynth_processor.min.js",
);
