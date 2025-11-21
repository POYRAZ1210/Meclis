import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";
import { instagramService } from "../server/services/instagram";

const app = express();

// Increase body size limits for file uploads (Vercel max: 4.5MB)
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: false, limit: '4mb' }));

// Health check endpoint for debugging
app.get('/api/health', (_req: Request, res: Response) => {
  const hasSupabaseUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  res.json({
    status: 'ok',
    environment: {
      hasSupabaseUrl,
      hasServiceKey,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
    }
  });
});

// Register API routes
registerRoutes(app);

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('API Error:', {
    status,
    message,
    stack: err.stack,
  });
  
  res.status(status).json({ 
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serve static files in production
serveStatic(app);

// Initialize Instagram service for Vercel (serverless)
// This will run on each cold start, but the service handles initialization gracefully
if (process.env.VERCEL) {
  instagramService.startAutoSync();
}

export default app;
