import express from "express";
import routes from "./src/routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import middleware from "./middleware/index.js";
import { testConnection } from "./db/db.js";

const app = express();

// Connect DB Prisma
await testConnection();
// Connect Middleware
middleware(app);
// Connect Routers
app.use("/api/", routes);
// Error handling middleware
errorHandler(app);

export default app;
