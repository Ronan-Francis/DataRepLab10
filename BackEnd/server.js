const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

// Connect to MongoDB
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin:admin@ronancluster.5yrb2kl.mongodb.net/?retryWrites=true&w=majority');
}

// Middleware
app.use(cors());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));
app.use('/static', express.static(path.join(__dirname, 'build/static')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// MongoDB Schema and Model
const bookSchema = new mongoose.Schema({
  title: String,
  cover: String,
  author: String,
});

const bookModel = mongoose.model('Labs.myBooks', bookSchema);

// CRUD Routes for Books
app.delete('/api/book/:id', async (req, res) => {
  console.log('Delete: ' + req.params.id);
  let book = await bookModel.findByIdAndDelete(req.params.id);
  res.send(book);
});

app.put('/api/book/:id', async (req, res) => {
  console.log('Update: ' + req.params.id);
  let book = await bookModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(book);
});

app.post('/api/book', (req, res) => {
  console.log(req.body);
  bookModel
    .create({
      title: req.body.title,
      cover: req.body.cover,
      author: req.body.author,
    })
    .then(() => {
      res.send('Book Created');
    })
    .catch(() => {
      res.send('Book NOT Created');
    });
});

app.get('/api/books', async (req, res) => {
  let books = await bookModel.find({});
  res.json(books);
});

app.get('/api/book/:identifier', async (req, res) => {
  console.log(req.params.identifier);
  let book = await bookModel.findById(req.params.identifier);
  res.send(book);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
