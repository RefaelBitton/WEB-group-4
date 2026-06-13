import { createGameServiceApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const app = createGameServiceApp();
app.listen(env.port, () => {
  console.log(`Game Service is running on port ${env.port}`);
});

connectToDatabase();
