require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const futuresRoutes = require('./routes/futures');
const chatRoutes = require('./routes/chat');
const blindspotsRoutes = require('./routes/blindspots');
const sparkplanRoutes = require('./routes/sparkplan');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/futures', futuresRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/blindspots', blindspotsRoutes);
app.use('/api/sparkplan', sparkplanRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Mirrova server running ✓', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Mirrova server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health\n`);
});