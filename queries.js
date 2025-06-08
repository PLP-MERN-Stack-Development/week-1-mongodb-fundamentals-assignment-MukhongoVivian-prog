// queries.js - Run MongoDB queries on the books collection

const { MongoClient } = require('mongodb');

// MongoDB connection details
const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Find all books in a specific genre
    const genre = 'Fiction';
    const booksByGenre = await collection.find({ genre }).toArray();
    console.log(`\n📚 Books in genre "${genre}":`);
    booksByGenre.forEach(book => console.log(`- ${book.title} by ${book.author}`));

    // 2. Find books published after a certain year
    const year = 1950;
    const booksAfterYear = await collection.find({ published_year: { $gt: year } }).toArray();
    console.log(`\n📅 Books published after ${year}:`);
    booksAfterYear.forEach(book => console.log(`- ${book.title} (${book.published_year})`));

    // 3. Find books by a specific author
    const author = 'George Orwell';
    const booksByAuthor = await collection.find({ author }).toArray();
    console.log(`\n Books by ${author}:`);
    booksByAuthor.forEach(book => console.log(`- ${book.title}`));

    // 4. Update the price of a specific book
    const titleToUpdate = 'The Hobbit';
    const newPrice = 16.99;
    const updateResult = await collection.updateOne(
      { title: titleToUpdate },
      { $set: { price: newPrice } }
    );
    console.log(`\n Updated ${updateResult.modifiedCount} book(s): "${titleToUpdate}" now costs $${newPrice}`);

    // 5. Delete a book by its title
    const titleToDelete = 'Moby Dick';
    const deleteResult = await collection.deleteOne({ title: titleToDelete });
    console.log(`\n Deleted ${deleteResult.deletedCount} book(s) with title "${titleToDelete}"`);

  } catch (err) {
    console.error(' Error:', err);
  } finally {
    await client.close();
    console.log('\n Connection closed');
  }
}

// Run the queries
runQueries();
