const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/plan', async (req, res) => {
  const { disliked, liked, favourites, avoid } = req.body;

  const prompt = `Plan exactly 7 dinners (Monday through Sunday) for a Danish family of 3-4 people.
Rules:
- Total cost of ALL 7 meals combined must be under 1000 DKK (realistic Bilka supermarket prices)
- Mix easy weekday meals (80-120 kr each) with slightly nicer weekend meals (130-160 kr each)
- All 7 meals must be completely different from each other
- No repeated cuisine types on consecutive days
- Never suggest these disliked meals: ${disliked?.length ? disliked.join(', ') : 'none'}
- Family favourites to take inspiration from: ${favourites?.length ? favourites.join(', ') : liked?.length ? liked.join(', ') : 'none'}
- Avoid repeating meals eaten recently: ${avoid?.length ? avoid.join(', ') : 'none'}
- Keep meals practical and family-friendly
- Include step-by-step cooking instructions in Danish

Reply ONLY with a valid JSON array, no markdown, no explanation:
[{"day":"Monday","name":"Meal name","cost":95,"time":"30 min","cuisine":"Italiensk","ingredients":["ingredient 1","ingredient 2","ingredient 3","ingredient 4","ingredient 5","ingredient 6"],"steps":["Trin 1...","Trin 2...","Trin 3...","Trin 4..."]},...]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map(c => c.text || '').join('');
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    const plan = JSON.parse(text.slice(start, end + 1));
    res.json({ plan });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/swap', async (req, res) => {
  const { day, budget, currentMeals, disliked, liked } = req.body;

  const prompt = `Suggest ONE dinner meal for a Danish family of 3-4 people.
- Max cost: ${budget} DKK (realistic Bilka price)
- Day: ${day}
- Do NOT repeat any of these already-planned meals: ${currentMeals?.join(', ') || 'none'}
- Never suggest: ${disliked?.join(', ') || 'none'}
- Family likes: ${liked?.join(', ') || 'none'}
- Include step-by-step cooking instructions in Danish

Reply ONLY with valid JSON, no markdown:
{"name":"Meal name","cost":NUMBER,"time":"XX min","cuisine":"...","ingredients":["item 1","item 2","item 3","item 4","item 5","item 6"],"steps":["Trin 1...","Trin 2...","Trin 3...","Trin 4..."]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map(c => c.text || '').join('');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const meal = JSON.parse(text.slice(start, end + 1));
    res.json({ meal });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('Madplan API kører! 🥗'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server kører på port ${PORT}`));

