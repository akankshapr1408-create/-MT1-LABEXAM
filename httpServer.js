/**
 * MT1 LAB EXAMINATION - Library Book Management Web Application
 * Part A: HTTP Module and Server Creation
 * 
 * Technology: Node.js Built-in HTTP and FS Modules (No Express)
 * Port: 3000
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port configuration
const PORT = 3000;

// In-memory array of sample books
const books = [
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

// Create HTTP Server
const server = http.createServer((req, res) => {
  // Parse request URL and method
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // A2 & A3: Route: GET /
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Welcome - Library Management System</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; }
          .container { max-width: 650px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          h1 { color: #1e40af; margin-bottom: 12px; }
          p { margin: 10px 0; color: #475569; }
          ul { line-height: 2; margin: 15px 0 25px 20px; }
          a { color: #2563eb; text-decoration: none; font-weight: 600; }
          a:hover { text-decoration: underline; }
          .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">Node.js HTTP Server</span>
          <h1>Welcome to Library Book Management Web Application</h1>
          <p>This server is created using the built-in Node.js <strong>http</strong> module on port ${PORT}.</p>
          <h3>Available Endpoints:</h3>
          <ul>
            <li><a href="/home">/home</a> - Static HTML page served using FS module</li>
            <li><a href="/books">/books</a> - Retrieve all books (JSON format)</li>
            <li><a href="/about">/about</a> - Application Information</li>
            <li><strong>POST /add-book</strong> - Add a new book (Accepts JSON body: id, title, author, price)</li>
          </ul>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // A2 & A3: Route: GET /books (Retrieve all books in JSON format)
  if (pathname === '/books' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(books, null, 2));
    return;
  }

  // A2: Route: GET /about (Library application information)
  if (pathname === '/about' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>About - Library Management System</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; }
          .container { max-width: 650px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          h1 { color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
          p { margin: 12px 0; font-size: 1rem; color: #334155; }
          a { color: #2563eb; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>About Library Application</h1>
          <p><strong>Application:</strong> Library Book Management Web Application</p>
          <p><strong>Subject:</strong> Full Stack Development &ndash; Node.js Lab Examination (MT1)</p>
          <p><strong>Technologies:</strong> Node.js, HTTP Module, FS Module, Express.js</p>
          <p><strong>Description:</strong> Demonstrates routing, HTTP methods, handling file serving with FS module, and REST APIs.</p>
          <p><a href="/">&larr; Back to Welcome</a> | <a href="/home">View Home Page &rarr;</a></p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // A2 & A4: Route: GET /home (Static file serving using FS module)
  if (pathname === '/home' && method === 'GET') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error: Unable to read index.html from public directory');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // A3: Route: POST /add-book (Add a new book record to array)
  if (pathname === '/add-book' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsedData = JSON.parse(body);
        const { id, title, author, price, category } = parsedData;

        // A5: Validation of required fields: id, title, author, price
        if (id === undefined || title === undefined || author === undefined || price === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            error: "Bad Request",
            message: "Missing required fields. 'id', 'title', 'author', and 'price' are all mandatory."
          }));
          return;
        }

        const newBook = {
          id: Number(id),
          title: String(title).trim(),
          author: String(author).trim(),
          price: Number(price),
          category: category ? String(category).trim() : 'General'
        };

        books.push(newBook);

        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          message: "Book added successfully",
          book: newBook
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: "Invalid JSON",
          message: "Could not parse JSON body: " + error.message
        }));
      }
    });
    return;
  }

  // A5: Error Handling - 404 for invalid routes
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    status: 404,
    error: "Not Found",
    message: `Cannot ${method} ${pathname}`
  }));
});

// Configure the server to listen on port 3000
server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
