import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PORT = process.env.TTS_PORT || 3001;
const CACHE_DIR = path.join(ROOT, '.tts-cache');
const MODEL_PATH = path.join(ROOT, 'models', 'kk_KZ-issai-high', 'kk_KZ-issai-high.onnx');
const PYTHON = path.join(ROOT, '.venv', 'Scripts', 'python.exe');
const PIPER_WORKER = path.join(__dirname, 'piper_worker.py');
const MAX_TEXT_LENGTH = 2000;
const SYNTH_TIMEOUT = 30_000;

// Vision provider config (Gemini by default)
const VISION_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const VISION_MODEL = process.env.VISION_MODEL || 'gemini-2.5-flash';

const STATIC_PHRASES = [
  // StartPage
  'Қожа Ахмет Яссауи кесенесінің инклюзивті гидіне қош келдіңіз. Бір рет басыңыз — көрмейтіндер режімі. Екі рет басыңыз — естімейтіндер режімі. Үш рет басыңыз — көмек режімі.',
  'Сіз таңдадыңыз: Көрмейтіндер режимі',
  'Сіз таңдадыңыз: Естімейтіндер режимі',
  'Сіз таңдадыңыз: Көмек режимі',
  'Өтінеміз, бір, екі немесе үш рет басыңыз.',
  // BlindMode
  'Көрмейтіндер режімі. Бір рет тиіңіз — артқа. Екі рет — менеджермен байланыс. Үш рет — камераны ашу. Төрт рет — аудио гид.',
  'Артқа оралуда',
  'Менеджерге қоңырау шалынуда',
  'Камера ашылуда',
  'Аудио гид басталуда.',
  'Аудио гид аяқталды. Бір рет тиіңіз — артқа.',
  'Аудио гид тоқтатылды.',
  // BlindMode — audio guide sections
  'Кіріспе. Қожа Ахмет Яссауи кесенесі — Түркістан қаласында орналасқан орта ғасыр сәулетінің асыл туындысы. Ол XIV ғасырдың соңында Темірдің бұйрығымен салынған және ЮНЕСКО-ның Дүниежүзілік мұра тізіміне енгізілген.',
  'Бас күмбез. Кесененің бас күмбезі Орталық Азиядағы ең ірілерінің бірі. Оның диаметрі шамамен он сегіз метр. Күмбез темір дәуірінің сәулетіне тән көгілдір глазурланған кірпішпен қапталған.',
  'Қазандық. Орталық залда ритуалдық су үшін алып қола қазан орналасқан. Оның диаметрі екі метрден асады, ал салмағы шамамен екі тонна. Қазан араб жазулары мен өсімдік өрнектерімен безендірілген.',
  'Яссауи зираты. Қожа Ахмет Яссауи зираты жеке бөлмеде орналасқан. Қабір тасы сұр-жасыл тастан жасалған және ою-өрнектермен безендірілген. Яссауи XII ғасырдың ұлы сопылық ақыны және ойшылы болды.',
  'Ішкі безендіру. Кесене қабырғалары мозаика және тас ою-өрнектермен безендірілген. Геометриялық өрнектер мен каллиграфиялық жазулар бірегей атмосфера жасайды. Безендіру элементтерінің көпшілігі алты жүз жылдан астам уақыт бойы сақталған.',
  // CameraRecognition
  'Камера ашылды. Бір рет тиіңіз — артқа. Екі рет — суретке түсіру.',
  'Сурет түсірілуде. Күте жасаңыз.',
  'Суретті талдау мүмкін болмады. Қайталап көріңіз.',
  // TextToSpeechPanel — quick phrases
  'Дәретхана қайда?',
  'Қайда жүруім керек?',
  'Шығу қайда?',
  'Менеджерді шақырыңыз.',
  'Маған көмек керек.',
  'Рахмет!',
  'Күте жасаңыз.',
  'Мен сізді түсінбеймін.',
];

fs.mkdirSync(CACHE_DIR, { recursive: true });

// Clean cache files older than 7 days on startup
try {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const f of fs.readdirSync(CACHE_DIR)) {
    const fp = path.join(CACHE_DIR, f);
    if (fs.statSync(fp).mtimeMs < cutoff) fs.unlinkSync(fp);
  }
} catch {}

function textHash(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex').slice(0, 16);
}

function getCachePath(text) {
  return path.join(CACHE_DIR, `${textHash(text)}.wav`);
}

// ─── Persistent Piper worker ───
let piperProc = null;
let piperBuffer = Buffer.alloc(0);
let piperPending = null;       // { resolve, reject, timer }
const piperQueue = [];

function spawnWorker() {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON, [PIPER_WORKER, MODEL_PATH], {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let ready = false;

    proc.stderr.on('data', (d) => {
      const msg = d.toString();
      if (!ready && msg.includes('PIPER_READY')) {
        ready = true;
        piperProc = proc;
        piperBuffer = Buffer.alloc(0);
        proc.stdout.on('data', onWorkerData);
        resolve();
      }
      const log = msg.replace(/PIPER_READY\r?\n?/g, '').trim();
      if (log) console.error('Piper:', log);
    });

    proc.on('error', (err) => {
      if (!ready) reject(err);
      else console.error('Piper worker error:', err.message);
    });

    proc.on('exit', (code) => {
      piperProc = null;
      if (!ready) { reject(new Error(`Worker exited during startup (code ${code})`)); return; }
      console.error(`Piper worker exited (code ${code})`);
      if (piperPending) {
        clearTimeout(piperPending.timer);
        piperPending.reject(new Error('Worker exited'));
        piperPending = null;
      }
      for (const item of piperQueue.splice(0)) item.reject(new Error('Worker exited'));
      setTimeout(async () => {
        try { await spawnWorker(); console.log('Piper worker restarted'); }
        catch (e) { console.error('Piper restart failed:', e.message); }
      }, 2000);
    });
  });
}

function onWorkerData(chunk) {
  piperBuffer = Buffer.concat([piperBuffer, chunk]);
  drainWorker();
}

function drainWorker() {
  while (piperBuffer.length >= 4) {
    const len = piperBuffer.readUInt32BE(0);
    if (len === 0) {
      piperBuffer = piperBuffer.subarray(4);
      if (piperPending) {
        clearTimeout(piperPending.timer);
        piperPending.reject(new Error('Synthesis failed'));
        piperPending = null;
      }
      nextInQueue();
      continue;
    }
    if (piperBuffer.length < 4 + len) return;
    const wav = Buffer.from(piperBuffer.subarray(4, 4 + len));
    piperBuffer = piperBuffer.subarray(4 + len);
    if (piperPending) {
      clearTimeout(piperPending.timer);
      piperPending.resolve(wav);
      piperPending = null;
    }
    nextInQueue();
  }
}

function nextInQueue() {
  if (piperPending || !piperProc || piperQueue.length === 0) return;
  const next = piperQueue.shift();
  piperPending = next;
  next.timer = setTimeout(() => {
    if (piperPending === next) {
      piperPending.reject(new Error('Synthesis timeout'));
      piperPending = null;
      nextInQueue();
    }
  }, SYNTH_TIMEOUT);
  piperProc.stdin.write(next.text + '\n', 'utf-8');
}

function synthesize(text) {
  return new Promise((resolve, reject) => {
    if (!piperProc) return reject(new Error('Piper worker not running'));
    const clean = text.trim().replace(/[\r\n]+/g, ' ');
    piperQueue.push({ text: clean, resolve, reject, timer: null });
    nextInQueue();
  });
}

async function pregenerate() {
  let generated = 0;
  let cached = 0;
  for (const phrase of STATIC_PHRASES) {
    const fp = getCachePath(phrase);
    if (fs.existsSync(fp)) { cached++; continue; }
    try {
      const wav = await synthesize(phrase);
      fs.writeFileSync(fp, wav);
      generated++;
    } catch (err) {
      console.error(`Pre-gen failed for "${phrase}":`, err.message);
    }
  }
  console.log(`Pre-generation: ${generated} new, ${cached} cached, ${STATIC_PHRASES.length} total`);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => {
  res.json({ name: 'Khoja Ahmed Yasawi TTS Server', endpoints: ['/api/health', '/api/tts', '/api/vision/analyze'] });
});

app.get('/api/health', (_req, res) => {
  const modelExists = fs.existsSync(MODEL_PATH);
  const pythonExists = fs.existsSync(PYTHON);
  res.json({
    status: modelExists && pythonExists ? 'ok' : 'degraded',
    model: modelExists,
    python: pythonExists,
    vision: !!VISION_API_KEY,
    cachedPhrases: fs.readdirSync(CACHE_DIR).length,
  });
});

// TTS endpoint — local Piper only
app.post('/api/tts', async (req, res) => {
  const { text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `Text too long (max ${MAX_TEXT_LENGTH} chars)` });
  }

  const cacheFile = getCachePath(text);

  // Serve from cache
  if (fs.existsSync(cacheFile)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('X-Cache', 'hit');
    return fs.createReadStream(cacheFile).pipe(res);
  }

  try {
    const wav = await synthesize(text);
    fs.writeFile(cacheFile, wav, () => {});
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('X-Cache', 'miss');
    res.send(wav);
  } catch (err) {
    console.error('Piper error:', err.message);
    res.status(500).json({ error: 'TTS synthesis failed' });
  }
});

// Vision analysis endpoint — online only (Gemini)
app.post('/api/vision/analyze', async (req, res) => {
  if (!VISION_API_KEY) {
    return res.status(503).json({
      error: 'Vision provider not configured. Set GEMINI_API_KEY in .env',
    });
  }

  const { image } = req.body || {};
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Base64 image is required' });
  }

  try {
    const requestBody = {
      contents: [{
        parts: [
          {
            text: `Сен Қазақстандағы Түркістан қаласындағы Қожа Ахмет Яссауи кесенесінің гидісің.
Бұл суретке қарап, онда не бейнеленгенін анықта.
Егер бұл кесене элементі болса (күмбез, қабырға, өрнек, қазан, жазу, декор, портал, т.б.), қазақ тілінде қысқа және нақты сипаттама бер (3-5 сөйлем).
Егер объект кесенемен байланысты емес, не көріп тұрғаныңды айт және кесене элементтеріне камераны бағыттауды ұсын.
Жауап қарапайым және түсінікті болсын.

Жауапты қатаң JSON форматында қайтар:
{"object_name": "объект атауы", "description": "сипаттама", "is_mausoleum_related": true/false}`
          },
          { inlineData: { mimeType: 'image/jpeg', data: image } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`Vision API error ${apiRes.status}:`, errText);
      return res.status(apiRes.status).json({ error: `Vision API error: ${apiRes.status}` });
    }

    const data = await apiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Vision API');

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('Vision analysis error:', err);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

app.listen(PORT, async () => {
  console.log(`TTS server running on http://localhost:${PORT}`);
  console.log(`Model: ${MODEL_PATH}`);
  console.log(`Python: ${PYTHON}`);
  console.log(`Cache: ${CACHE_DIR}`);
  console.log(`Vision: ${VISION_API_KEY ? 'configured' : 'NOT configured (set GEMINI_API_KEY in .env)'}`);

  // Start persistent Piper worker (loads model once, stays alive)
  console.log('Starting Piper worker...');
  try {
    await spawnWorker();
    await synthesize('тест');
    console.log('Piper worker ready');
  } catch (err) {
    console.error('Piper startup failed:', err.message);
  }

  // Pre-generate static phrases
  await pregenerate();
});
