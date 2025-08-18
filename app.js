// const uri = "mongodb+srv://annafridamariajonsson:0909mongo@words.mongodb.net/?retryWrites=true&w=majority";
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000; // or any port you prefer
app.listen(port, () => {
  console.log(`Server runs on port ${port}`);
})
// Connection string
const uri = "mongodb+srv://annafridamariajonsson:0909mongo@words.ckgby.mongodb.net/?retryWrites=true&w=majority&appName=Words";
let client;
let db;

// Middleware
app.use(express.json());



// Connect to MongoDB
async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB!");
    db = client.db("PrimaLingua");
  }
  return { client, db };
}

// Setup API routes
app.get('/api/words', async (req, res) => {
  try {
    const { db } = await connectToMongoDB();
    const collection = db.collection("Words");
    const words = await collection.find({}).toArray();
    res.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

// Get a single word by ID
app.get('/api/words/:id', async (req, res) => {
  try {
    const { db } = await connectToMongoDB();
    const collection = db.collection("Words");
    const word = await collection.findOne({ identifier: req.params.id });
    
    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }
    res.json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    res.status(500).json({ error: "Failed to fetch word" });
  }
});

// Start the server
app.listen(port, async () => {
  try {
    await connectToMongoDB();
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error("Failed to start server:", error);
  }
});

// Handle application shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});