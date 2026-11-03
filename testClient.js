/**
 * MT1 LAB EXAMINATION - Automated Test Suite
 * Tests all Part A and Part B endpoints
 */

import http from 'http';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      if (!reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' MT1 LAB EXAMINATION - AUTOMATED VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS\x1b[0m : ${message}`);
      passed++;
    } else {
      console.log(`  \x1b[31m✘ FAIL\x1b[0m : ${message}`);
      failed++;
    }
  }

  // --- PART A TESTS (PORT 3000) ---
  console.log('\x1b[1m\x1b[34m[PART A] Testing HTTP Server (http://localhost:3000)\x1b[0m');
  try {
    // 1. GET /
    const resRoot = await runRequest('http://127.0.0.1:3000/');
    assert(resRoot.status === 200 && resRoot.headers['content-type']?.includes('text/html'), 'GET / returns HTML welcome message (Status 200)');

    // 2. GET /books
    const resBooks = await runRequest('http://127.0.0.1:3000/books');
    const booksData = JSON.parse(resBooks.data);
    assert(resBooks.status === 200 && Array.isArray(booksData) && booksData.length >= 3, 'GET /books returns JSON book list (Status 200)');

    // 3. GET /about
    const resAbout = await runRequest('http://127.0.0.1:3000/about');
    assert(resAbout.status === 200 && resAbout.data.includes('Library'), 'GET /about returns application information (Status 200)');

    // 4. GET /home
    const resHome = await runRequest('http://127.0.0.1:3000/home');
    assert(resHome.status === 200 && resHome.data.includes('Library Book Management System'), 'GET /home serves public/index.html using FS module (Status 200)');

    // 5. POST /add-book
    const newBookPayload = JSON.stringify({
      id: 4,
      title: "Clean Code",
      author: "Robert C. Martin",
      price: 550,
      category: "Programming"
    });
    const resAdd = await runRequest('http://127.0.0.1:3000/add-book', { method: 'POST' }, newBookPayload);
    const addResult = JSON.parse(resAdd.data);
    assert(resAdd.status === 201 && addResult.message === "Book added successfully", 'POST /add-book accepts JSON and returns success message (Status 201)');

    // 6. Invalid Route -> 404
    const res404 = await runRequest('http://127.0.0.1:3000/unknown-route');
    assert(res404.status === 404, 'Invalid route returns 404 Not Found');

  } catch (err) {
    console.error('\x1b[31mError testing Part A (Make sure httpServer.js is running on port 3000):\x1b[0m', err.message);
  }

  // --- PART B TESTS (PORT 4000) ---
  console.log('\n\x1b[1m\x1b[34m[PART B] Testing Express REST API (http://localhost:4000)\x1b[0m');
  try {
    // 1. GET /books
    const resExpBooks = await runRequest('http://127.0.0.1:4000/books');
    const expBooks = JSON.parse(resExpBooks.data);
    assert(resExpBooks.status === 200 && Array.isArray(expBooks), 'GET /books retrieves all books (Status 200)');

    // 2. GET /books/:id
    const resExpBook1 = await runRequest('http://127.0.0.1:4000/books/1');
    const book1 = JSON.parse(resExpBook1.data);
    assert(resExpBook1.status === 200 && book1.id === 1 && book1.title === "The Alchemist", 'GET /books/1 retrieves book by ID (Status 200)');

    // 3. GET /books/:id (Not Found)
    const resExpBookNotFound = await runRequest('http://127.0.0.1:4000/books/999');
    assert(resExpBookNotFound.status === 404, 'GET /books/999 returns 404 Not Found');

    // 4. POST /books
    const samplePost = JSON.stringify({
      id: 4,
      title: "Clean Code",
      author: "Robert C. Martin",
      price: 550,
      category: "Programming"
    });
    const resPost = await runRequest('http://127.0.0.1:4000/books', { method: 'POST' }, samplePost);
    const postData = JSON.parse(resPost.data);
    assert(resPost.status === 201 && postData.book?.id === 4 && postData.message === "Book added successfully", 'POST /books creates new book (Status 201)');

    // 5. PUT /books/:id
    const updatePayload = JSON.stringify({
      price: 499,
      category: "Classic Literature"
    });
    const resPut = await runRequest('http://127.0.0.1:4000/books/1', { method: 'PUT' }, updatePayload);
    const putData = JSON.parse(resPut.data);
    assert(resPut.status === 200 && putData.book?.price === 499, 'PUT /books/1 updates book details (Status 200)');

    // 6. DELETE /books/:id
    const resDel = await runRequest('http://127.0.0.1:4000/books/1', { method: 'DELETE' });
    const delData = JSON.parse(resDel.data);
    assert(resDel.status === 200 && delData.message === "Book deleted successfully", 'DELETE /books/1 deletes book (Status 200)');

    // 7. Verify deletion -> 404
    const resCheckDel = await runRequest('http://127.0.0.1:4000/books/1');
    assert(resCheckDel.status === 404, 'GET /books/1 returns 404 after deletion');

    // 8. 404 for invalid express route
    const resExp404 = await runRequest('http://127.0.0.1:4000/non-existent-api');
    assert(resExp404.status === 404, 'Invalid endpoint returns 404 Not Found');

  } catch (err) {
    console.error('\x1b[31mError testing Part B (Make sure expressApp.js is running on port 4000):\x1b[0m', err.message);
  }

  console.log('\n======================================================');
  console.log(` Summary: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
  console.log('======================================================\n');
}

export { runTestSuite, runRequest };

if (process.argv[1] && process.argv[1].endsWith('testClient.js')) {
  runTestSuite();
}
