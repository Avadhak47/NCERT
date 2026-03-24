import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function adminApiPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use('/api/admin/save', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const filepath = path.resolve(__dirname, 'src/data/states.json');
              fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error("Failed to save states.json:", err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      server.middlewares.use('/api/admin/upload-image', (req, res) => {
        if (req.method === 'POST') {
          // Increase limit by handling chunks (standard Node.js streams)
          const chunks: any[] = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
             try {
                const body = Buffer.concat(chunks).toString('utf8');
                const data = JSON.parse(body);
                const { imageBase64, imageUrl, filename = 'upload' } = data;
                
                let buffer: Buffer;

                if (imageBase64) {
                    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
                    buffer = Buffer.from(base64Data, 'base64');
                } else if (imageUrl) {
                    const fetchRes = await fetch(imageUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                        }
                    });
                    if (!fetchRes.ok) {
                        throw new Error(`Failed to fetch image: ${fetchRes.status} ${fetchRes.statusText}`);
                    }
                    const arrayBuffer = await fetchRes.arrayBuffer();
                    buffer = Buffer.from(arrayBuffer);
                } else {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'No image provided' }));
                }

                const outDir = path.resolve(__dirname, 'public/downloaded_images');
                if (!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir, { recursive: true });
                }

                const safeName = filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
                const outFilename = `${safeName}_${Date.now()}.webp`;
                const outPath = path.join(outDir, outFilename);

                await sharp(buffer)
                    .webp({ quality: 80, effort: 4 })
                    .toFile(outPath);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ url: `/downloaded_images/${outFilename}` }));

             } catch (err) {
                console.error("Upload error:", err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: String(err) }));
             }
          });
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminApiPlugin()],
});
