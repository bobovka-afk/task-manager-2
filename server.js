const express = require('express');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const app = express();
const PORT = process.env.PORT || 4200;

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api', taskRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
