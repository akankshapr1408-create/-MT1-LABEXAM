/**
 * MT1 LAB EXAMINATION - Library Book Management Web Application
 * Part B: Library Management REST API Using Express.js
 * 
 * Technology: Express.js
 * Port: 4000
 */

import express from 'express';

// Initialize Express Application
const app = express();
const PORT = 4000;

// B1: Configure JSON parsing middleware
app.use(express.json());

// Handle malformed JSON input
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Malformed JSON payload in request body"
    });
  }
  next();
});

// B1 & B3: Initialize an array containing at least three sample book records
let books = [
  {
    id: 1,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 350,
    category: "Fiction"
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 450,
    category: "Classic"
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    price: 399,
    category: "Dystopian"
  }
];

// Root endpoint for API documentation overview
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Library Management REST API using Express.js",
    server: `http://localhost:${PORT}`,
    endpoints: {
      "GET /books": "Retrieve all books",
      "GET /books/:id": "Retrieve a book by ID",
      "POST /books": "Add a new book",
      "PUT /books/:id": "Update book details by ID",
      "DELETE /books/:id": "Delete a book by ID"
    }
  });
});

// B2: GET /books - Retrieve all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// B2 & B4: GET /books/:id - Retrieve a book by ID using route parameters
app.get('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  if (isNaN(bookId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID parameter must be a valid integer"
    });
  }

  const book = books.find(b => b.id === bookId);

  // Return HTTP status code 404 when book is not found
  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  res.status(200).json(book);
});

// B2 & B4: POST /books - Add a new book
app.post('/books', (req, res) => {
  const { id, title, author, price, category } = req.body;

  // Validate required book details
  if (id === undefined || !title || !author || price === undefined) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Missing required fields: id, title, author, and price are mandatory."
    });
  }

  const numId = Number(id);
  const numPrice = Number(price);

  if (isNaN(numId) || isNaN(numPrice)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "'id' and 'price' must be valid numbers."
    });
  }

  // Check for unique book ID
  const existingBook = books.find(b => b.id === numId);
  if (existingBook) {
    return res.status(400).json({
      error: "Duplicate ID",
      message: `Book with id ${numId} already exists.`
    });
  }

  const newBook = {
    id: numId,
    title: String(title).trim(),
    author: String(author).trim(),
    price: numPrice,
    category: category ? String(category).trim() : 'General'
  };

  // Add the new book record to the array
  books.push(newBook);

  // Return HTTP status code 201 when book is successfully created
  res.status(201).json({
    message: "Book added successfully",
    book: newBook
  });
});

// B2 & B4: PUT /books/:id - Update book details
app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  if (isNaN(bookId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID parameter must be a valid integer"
    });
  }

  const index = books.findIndex(b => b.id === bookId);

  // Return HTTP status code 404 when book is not found
  if (index === -1) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  const { title, author, price, category } = req.body;

  if (title !== undefined) books[index].title = String(title).trim();
  if (author !== undefined) books[index].author = String(author).trim();
  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Price must be a valid number"
      });
    }
    books[index].price = numPrice;
  }
  if (category !== undefined) books[index].category = String(category).trim();

  res.status(200).json({
    message: "Book updated successfully",
    book: books[index]
  });
});

// B2 & B4: DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  if (isNaN(bookId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID parameter must be a valid integer"
    });
  }

  const index = books.findIndex(b => b.id === bookId);

  // Return HTTP status code 404 when book is not found
  if (index === -1) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // Remove the book from the array
  const deletedBook = books.splice(index, 1)[0];

  res.status(200).json({
    message: "Book deleted successfully",
    book: deletedBook
  });
});

// Handle 404 for invalid routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Configure the application to listen on port 4000
const server = app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});

export default app;
