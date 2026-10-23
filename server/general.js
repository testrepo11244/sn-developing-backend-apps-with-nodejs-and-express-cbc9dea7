const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Base URL of the running Book Review API (used by the Axios implementations below)
const BASE_URL = "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/*                             Registered users                               */
/* -------------------------------------------------------------------------- */

// Task 7: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists! Please login" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
});

/* -------------------------------------------------------------------------- */
/*                  General routes (direct implementation)                    */
/* -------------------------------------------------------------------------- */

// Task 2: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 3: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(books[isbn]);
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// Task 4: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );

  if (booksByAuthor.length > 0) {
    return res.status(200).send(booksByAuthor);
  }
  return res.status(404).json({ message: `No books found for author: ${req.params.author}` });
});

// Task 5: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksByTitle = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );

  if (booksByTitle.length > 0) {
    return res.status(200).send(booksByTitle);
  }
  return res.status(404).json({ message: `No books found for title: ${req.params.title}` });
});

// Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(books[isbn].reviews);
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

/* -------------------------------------------------------------------------- */
/*   Task 11: Retrieve books by list / ISBN / author / title using Axios      */
/*            with Promise callbacks and async/await                          */
/* -------------------------------------------------------------------------- */

// Helper: fetch the full book list as a Promise (promise-callback pattern)
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

// Helper: fetch book details by ISBN as a Promise (promise-callback pattern)
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/isbn/${isbn}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

// Get the full list of books – using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const bookList = await getAllBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving the book list" });
  }
});

// Get book details by ISBN – using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  getBookByISBN(req.params.isbn)
    .then((book) => res.status(200).send(book))
    .catch((error) =>
      res.status(500).json({ message: `Error retrieving book with ISBN ${req.params.isbn}` })
    );
});

// Get book details by author – using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: `Error retrieving books by author ${req.params.author}` });
  }
});

// Get book details by title – using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: `Error retrieving books with title ${req.params.title}` });
  }
});

module.exports.general = public_users;