import express from 'express';
import { trackOpen, handleUnsubscribe } from '../services/emailService.js';

const router = express.Router();

// GET /api/track/open/:token - Track email open (1x1 pixel)
router.get('/open/:token', async (req, res) => {
    await trackOpen(req.params.token);

    // Return a 1x1 transparent GIF
    const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
    );

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pixel);
});

// GET /api/unsubscribe/:token - Unsubscribe page
router.get('/unsubscribe/:token', async (req, res) => {
    const result = await handleUnsubscribe(req.params.token);

    // Simple HTML response
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unsubscribe - Plainly</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: ${result.success ? '#27AE60' : '#E74C3C'}; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${result.success ? '✅ Unsubscribed' : '❌ Error'}</h1>
        <p>${result.message}</p>
      </div>
    </body>
    </html>
  `);
});

export default router;
