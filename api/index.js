const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const meetsRoutes = require('./routes/meets');
const athletesRoutes = require('./routes/athletes');
const teamsRoutes = require('./routes/teams');
const searchRoutes = require('./routes/search');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', homeRoutes);
app.use('/api/meets', meetsRoutes);
app.use('/api/athletes', athletesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
