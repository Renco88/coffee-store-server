const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wibzr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected to MongoDB!");

    // Database and collection
    const coffeeCollection = client.db('coffeeDB').collection('coffee');

    // GET: Retrieve all coffee entries
    app.get('/coffee', async (req, res) => {
      try {
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error retrieving coffee:", error);
        res.status(500).send({ message: "Error retrieving coffee data" });
      }
    });

    // GET: Retrieve a single coffee by ID
    app.get('/coffee/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Coffee ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "Coffee not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error retrieving coffee by ID:", error);
        res.status(500).send({ message: "Error retrieving coffee data" });
      }
    });

    // PUT: Update a coffee entry by ID
    app.put('/coffee/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Coffee ID" });
        }
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateCoffee = req.body;

        // Update coffee fields
        const coffee = {
          $set: {
            name:updateCoffee.name,
            chef:updateCoffee.chef,
            taste:updateCoffee.taste,
            photo:updateCoffee.photo,
            supplier:updateCoffee.supplier,
            categorya:updateCoffee.category,
            details:updateCoffee.details,
          }
        };

        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result);
      } catch (error) {
        console.error("Error updating coffee:", error);
        res.status(500).send({ message: "Error updating coffee data" });
      }
    });

    // POST: Add a new coffee entry
    app.post('/coffee', async (req, res) => {
      try {
        const newCoffee = req.body;
        console.log('Adding new coffee:', newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error adding coffee:", error);
        res.status(500).send({ message: "Error adding coffee data" });
      }
    });

    // DELETE: Delete a coffee entry by ID
    app.delete('/coffee/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Coffee ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Coffee not found" });
        }

        res.send({ message: "Coffee deleted successfully", result });
      } catch (error) {
        console.error("Error deleting coffee:", error);
        res.status(500).send({ message: "Error deleting coffee data" });
      }
    });

    // Ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB deployment. Connection successful!");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
  res.send('Coffee making server is running!');
});

// Server listening
app.listen(port, () => {
  console.log(`Coffee server is running on port: ${port}`);
});
