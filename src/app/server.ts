import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.apiPort, () => {
  console.log(`Loyalty demo API listening on port ${config.apiPort}`);
});
