import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
]);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze-meal', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body as {
        imageBase64?: string;
        mimeType?: string;
      };

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Missing image data.' });
        return;
      }

      const normalizedMime = (mimeType || 'image/jpeg').toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
        res.status(400).json({
          error: 'Unsupported image format. Please use JPEG, PNG, or HEIC.',
        });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'Gemini API is currently unavailable.',
          code: 'API_UNAVAILABLE',
        });
        return;
      }

      const imagePart = {
        inlineData: {
          mimeType: normalizedMime === 'image/jpg' ? 'image/jpeg' : normalizedMime,
          data: imageBase64,
        },
      };

      const textPart = {
        text: [
          'Analyze this meal photo for a calm, friendly calorie tracker called SnapCal.',
          'Determine if there is food or a beverage in the image.',
          'If no food or drink is present, set foodDetected to false and items to an empty array.',
          'If food is present, identify each distinct food item visible on the plate or in the bowl (up to 4 items; for a unified dish like a salad bowl or oatmeal bowl, you may group into 1-3 logical edible items).',
          'For EACH detected item, provide the top 3 plausible food labels ordered from most likely to least likely.',
          'For each candidate label provide:',
          '- label: concise, natural human food name (e.g. "Grilled Salmon", "Avocado Toast with Poached Egg")',
          '- confidence: number between 0.0 and 1.0 representing certainty',
          '- defaultGrams: realistic estimated serving weight in grams shown in the photo (integer between 15 and 1200)',
          '- kcalPer100g: accurate USDA-style calories per 100 grams (integer between 5 and 900)',
          'Use neutral, factual food names only.',
        ].join(' '),
      };

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodDetected: {
                type: Type.BOOLEAN,
                description: 'True if edible food or drink is visible in the photo.',
              },
              suggestedMealType: {
                type: Type.STRING,
                description: 'One of: Breakfast, Lunch, Dinner, Snack',
              },
              items: {
                type: Type.ARRAY,
                description: 'Distinct food items detected in the photo.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    predictions: {
                      type: Type.ARRAY,
                      description: 'Top 3 plausible labels for this food item, highest confidence first.',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          confidence: { type: Type.NUMBER },
                          defaultGrams: { type: Type.INTEGER },
                          kcalPer100g: { type: Type.INTEGER },
                        },
                        required: ['label', 'confidence', 'defaultGrams', 'kcalPer100g'],
                      },
                    },
                  },
                  required: ['predictions'],
                },
              },
            },
            required: ['foodDetected', 'items'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Received an empty response from food recognition.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to analyze meal photo.';
      console.error('Analyze meal error:', message);
      res.status(502).json({
        error: 'Food recognition service could not process this photo right now.',
        details: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SnapCal server running on http://localhost:${PORT}`);
  });
}

startServer();
