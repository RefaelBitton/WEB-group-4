import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { createUserServiceApp } from "./app.js";

await connectToDatabase();

const app = createUserServiceApp();

app.listen(env.port, () => {
  console.log(`User Service listening on port ${env.port}`);
});
