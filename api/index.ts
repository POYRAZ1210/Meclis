import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";
import { instagramService } from "../server/services/instagram";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app);

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Serve static files in production
serveStatic(app);

// Initialize Instagram service for Vercel (serverless)
// This will run on each cold start, but the service handles initialization gracefully
if (process.env.VERCEL) {
  instagramService.startAutoSync();
}

export default app;
