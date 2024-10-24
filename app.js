const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const secret = 'supersecreto';

const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456' 
  }
];

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'] || req.query.token;

  if (!token) {
      return res.redirect('/login');
  }

  jwt.verify(token, secret, (err, decoded) => {
      if (err) {
          return res.redirect('/login');
      }
      req.userId = decoded.id;
      next();
  });
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
      const token = jwt.sign({ id: user.id, username: user.username }, secret, {
          expiresIn: '1h' 
      });

      return res.json({
          success: true,
          message: 'Autenticación exitosa!',
          token: token
      });
  } else {
      return res.status(401).json({
          success: false,
          message: 'Usuario o contraseña incorrectos'
      });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('*', (req, res) => {
  res.redirect('/login');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
