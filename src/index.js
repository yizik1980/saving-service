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
    const header = ['תאריך', ...players.map((_, i) => `שחקן ${i + 1}`)].join(',') + '\n';
    fs.writeFileSync(CSV_FILE, '\uFEFF' + header, 'utf8');
  }
  fs.appendFileSync(CSV_FILE, row, 'utf8');

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Saving service running on port ${PORT}`);
});

export default app;
