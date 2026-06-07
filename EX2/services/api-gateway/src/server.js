import { env } from "./config/env.js";
import { createApiGatewayApp } from "./app.js";

const app = createApiGatewayApp();

app.listen(env.port, () => {
  console.log(`API Gateway listening on port ${env.port}`);
});
