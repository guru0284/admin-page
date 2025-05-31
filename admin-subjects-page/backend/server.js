const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let subjectsList = [];

app.post('/subjects', (req, res) => {
  const { class: className, subjects } = req.body;
  console.log('Received:', { className, subjects });
  subjectsList.push({ className, subjects });
  res.json({ success: true, message: 'Subjects saved!' });
});

app.get('/subjects', (req, res) => {
  res.json(subjectsList);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
