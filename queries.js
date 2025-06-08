// queries.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log('\n--- Task 2: Basic CRUD Operations ---');

    // 1. Find all books in a specific genre (e.g. "Fiction")
    const genre = 'Fiction';
    const booksByGenre = await collection.find({ genre }).toArray();
    console.log(`Books in genre "${genre}":`, booksByGenre.length);

    // 2. Find books published after a certain year (e.g. 1950)
    const year = 1950;
    const booksAfterYear = await collection.find({ published_year: { $gt: year } }).toArray();
    console.log(`Books published after ${year}:`, booksAfterYear.length);

    // 3. Find books by a specific author (e.g. "George Orwell")
    const author = 'George Orwell';
    const booksByAuthor = await collection.find({ author }).toArray();
    console.log(`Books by ${author}:`, booksByAuthor.length);

    // 4. Update the price of a specific book (e.g. "1984" to 15.99)
    const bookToUpdate = '1984';
    const newPrice = 15.99;
    const updateResult = await collection.updateOne(
      { title: bookToUpdate },
      { $set: { price: newPrice } }
    );
    console.log(`Updated price of "${bookToUpdate}":`, updateResult.modifiedCount === 1);

    // 5. Delete a book by its title (e.g. "Moby Dick")
    const bookToDelete = 'Moby Dick';
    const deleteResult = await collection.deleteOne({ title: bookToDelete });
    console.log(`Deleted "${bookToDelete}":`, deleteResult.deletedCount === 1);

    console.log('\n--- Task 3: Advanced Queries ---');

    // 6. Find books that are both in stock and published after 2010
    const recentInStock = await collection.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    console.log('Books in stock and published after 2010:', recentInStock.length);

    // 7. Use projection to return only title, author, and price
    const projectionResult = await collection.find(
      { in_stock: true },
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).toArray();
    console.log('Projection (title, author, price) count:', projectionResult.length);

    // 8. Sorting books by price ascending
    const sortAsc = await collection.find({})
      .sort({ price: 1 })
      .toArray();
    console.log('Lowest price book:', sortAsc[0]?.title, sortAsc[0]?.price);

    // Sorting books by price descending
    const sortDesc = await collection.find({})
      .sort({ price: -1 })
      .toArray();
    console.log('Highest price book:', sortDesc[0]?.title, sortDesc[0]?.price);

    // 9. Pagination: 5 books per page, page 2 (skip first 5)
    const pageSize = 5;
    const pageNumber = 2;
    const pageBooks = await collection.find({})
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize)
      .toArray();
    console.log(`Books on page ${pageNumber}:`, pageBooks.length);

    console.log('\n--- Task 4: Aggregation Pipelines ---');

    // 10. Average price of books by genre
    const avgPriceByGenre = await collection.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray();
    console.log('Average price by genre:', avgPriceByGenre);

    // 11. Find the author with the most books
    const authorWithMostBooks = await collection.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('Author with most books:', authorWithMostBooks[0]);

    // 12. Group books by publication decade and count them
    const booksByDecade = await collection.aggregate([
      {
        $project: {
          decade: {
            $concat: [
              { $toString: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } },
              "s"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$decade",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('Books grouped by decade:', booksByDecade);

    console.log('\n--- Task 5: Indexing and Performance ---');

    // 13. Create index on title
    await collection.createIndex({ title: 1 });
    console.log('Index created on title');

    // 14. Create compound index on author and published_year
    await collection.createIndex({ author: 1, published_year: 1 });
    console.log('Compound index created on author and published_year');

    // 15. Use explain() to show performance of a query using title index
    const explainResult = await collection.find({ title: "1984" }).explain("executionStats");
    console.log('Explain output for title search:', {
      queryPlanner: explainResult.queryPlanner.winningPlan,
      executionStats: {
        totalDocsExamined: explainResult.executionStats.totalDocsExamined,
        totalKeysExamined: explainResult.executionStats.totalKeysExamined,
        executionTimeMillis: explainResult.executionStats.executionTimeMillis,
      }
    });

  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

runQueries();
