require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Connection string
const uri = process.env.MONGODB_URI;
let client = null;
let db = null;

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

console.log('Environment check:');
console.log('PORT:', port);
console.log('MONGODB_URI exists:', !!uri);
console.log('MONGODB_URI first 20 chars:', uri ? uri.substring(0, 20) : 'undefined');

// Middleware
app.use(express.json());

// Connect to MongoDB
async function connectToMongoDB() {
  if (!client) {
    try {
      console.log('Creating new MongoDB connection...');
      client = new MongoClient(uri, {
        // Add SSL options for better Render compatibility
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      });
      
      await client.connect();
      
      db = client.db("PrimaLingua");
      
      // Handle connection events
      client.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
      
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  
  return { client, db };
}

// Setup API routes
app.get('/', (req, res) => {
  res.json({ message: "Prima Lingua is running!" });
});

app.get('/api/debug', async (req, res) => {
  try {
    if (!db) {
      await connectToMongoDB();
    }
    
    // List all collections to see exact names
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    res.json({
      database: db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single word by ID
app.get('/api/words/:id', async (req, res) => {
  if (!db) {
    await connectToMongoDB();
  }
  try {
    const collection = db.collection("Words");
    const word = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }
    res.json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    res.status(500).json({ error: "Failed to fetch word" });
  }
});

app.get('/api/words', async (req, res) => {
  try {
    console.log('Starting to fetch words...');
    
    // Don't create new connection, use existing one
    if (!db) {
      await connectToMongoDB();
    }
    
    console.log('Using existing database connection');
    const collection = db.collection("Words");
    console.log('Collection reference created for "Words"');
    
    const words = await collection.find({}).toArray();
    console.log('Query executed, found', words.length, 'words');
    
    res.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

// Get a all translations by language
app.get('/api/translations/:language', async (req, res) => {
  if (!db) {
    await connectToMongoDB();
  }
  try {
     console.log('Looking for language:', req.params.language);
    const collection = db.collection("Translations");
    const translations = await collection.find({language: req.params.language}).toArray();
    
    if (translations.length === 0) {
      return res.status(404).json({ error: "Translations not found" });
    }
    res.json(translations);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Failed to fetch translations" });
  }
});

app.get('/api/translations', async (req, res) => {
  try {
    console.log('Starting to fetch translations...');
    if (!db) {
      await connectToMongoDB();
    }
    
    console.log('Using existing database connection');
    const collection = db.collection("Translations");
    console.log('Collection reference created for "Translations"');
    
    const translations = await collection.find({}).toArray();
    console.log('Query executed, found', translations.length, 'translations');
    
    res.json(translations);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Failed to fetch translations" });
  }
});

// Get a all translations by language
app.get('/api/languages/:languageName', async (req, res) => {
  if (!db) {
    await connectToMongoDB();
  }
  try {
     console.log('Looking for language:', req.params.language);
    const collection = db.collection("Languages");
    const language = await collection.find({name: req.params.languageName}).toArray();
    
    if (!language) {
      return res.status(404).json({ error: "Language not found" });
    }
    res.json(language);
  } catch (error) {
    console.error("Error fetching language:", error);
    res.status(500).json({ error: "Failed to fetch language" });
  }
});

app.get('/api/languages', async (req, res) => {
  try {
        console.log('Starting to fetch languages...');
    if (!db) {
      await connectToMongoDB();
    }
        
    console.log('Using existing database connection');
    const collection = db.collection("Languages");
    console.log('Collection reference created for "Languages"');
    
    const languages = await collection.find({}).toArray();
    console.log('Query executed, found', languages.length, 'languages');
    
    res.json(languages);

  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({error: "Failed to fetch languages"});
  }
});

// Start server with MongoDB connection
async function startServer() {
  try {
    await connectToMongoDB();
    
    app.listen(port, () => {
      console.log(`Server runs on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle application shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

// Start the server
startServer();