import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_FILE = path.join(__dirname, '..', 'data', 'games.csv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/game', (req, res) => {
  const { players } = req.body;
  if (!Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: 'invalid players' });
  }

  const date = new Date().toLocaleString('he-IL');
  const row = [date, ...players].map((v) => `"${v}"`).join(',') + '\n';

  if (!fs.existsSync(CSV_FILE)) {
    fs.mkdirSync(path.dirname(CSV_FILE), { recursive: true });
    const header = ['Date', ...players.map((_, i) => `Player ${i + 1}`)].join(',') + '\n';
    fs.writeFileSync(CSV_FILE, '\uFEFF' + header, 'utf8');
  }
  fs.appendFileSync(CSV_FILE, row, 'utf8');

  res.json({ ok: true });
});

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  values.push(current);
  return values;
}

app.get('/api/game', (_req, res) => {
  if (!fs.existsSync(CSV_FILE)) return res.json([]);
  const content = fs.readFileSync(CSV_FILE, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Saving service running on port ${PORT}`);
});

export default app;
