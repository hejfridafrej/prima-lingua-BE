require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Models
const Word = require('./models/word');
const Translation = require('./models/translation');
const Language = require('./models/language');
const Category = require('./models/category');
const Class = require('./models/class');

const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Connection string
const uri = process.env.MONGODB_URI;
let client = null;
let db = null;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://prima-lingua.onrender.com'],
  credentials: true
}));

console.log('Environment check:');
console.log('PORT:', port);
console.log('MONGODB_URI exists:', !!uri);


let isConnected = false;
// Connect to MongoDB
const connectToMongoDB = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    isConnected = true;
    console.log('Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

connectToMongoDB();

// Setup API routes
app.get('/', (req, res) => {
  res.json({ message: "Prima Lingua is running!" });
});

// app.get('/api/debug', async (req, res) => {
//   try {
//     // List all collections to see exact names
//     const collections = await db.listCollections().toArray();
//     console.log('Available collections:', collections.map(c => c.name));

//     res.json({
//       database: db.databaseName,
//       collections: collections.map(c => c.name)
//     });
//   } catch (error) {
//     console.error('Debug error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.get('/api/vocabulary/', async (req, res) => {
  try {
    const { sourceLanguage, targetLanguage, category, classId, page, limit } = req.query; // Use alias for classId?

    if (!sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: "sourceLanguage and targetLanguage are required" });
    }

    const [sourceLang, targetLang] = await Promise.all([
      Language.findOne({ short_name: sourceLanguage }),
      Language.findOne({ short_name: targetLanguage })
    ]);
      
    const wordFilter = {};
    if (category) {
      wordFilter.category = {$in: category.split(',').map(id => new mongoose.Types.ObjectId(id))};
    }
    if (classId) {
      wordFilter.class = {$in: classId.split(',').map(id => new mongoose.Types.ObjectId(id))};
    }
    const totalItems = await Word.countDocuments(wordFilter);
    const pageNume = parseInt(page) || 1;
    const limitNume = parseInt(limit) || 50;
    const skipNume = (page - 1) * limit;

    const words = await Word.find(wordFilter).skip(skipNume).limit(limitNume)
      .populate('category')
      .populate('class');
    const wordIds = words.map(w => w._id);

    const [sourceTranslations, targetTranslations] = await Promise.all([
      Translation.find({
        word_id: { $in: wordIds }, // MongoDB operator: "word_id is IN this array"
        language: sourceLang._id
      }).populate('language'),

      Translation.find({
        word_id: { $in: wordIds },
        language: targetLang._id
      }).populate('language')
    ]);

    const sourceMap = new Map(
      sourceTranslations.map(t => [t.word_id.toString(), t])
    );
    const targetMap = new Map(
      targetTranslations.map(t => [t.word_id.toString(), t])
    );

    const vocabulary = words.map(word => {
      const wordIdStr = word._id.toString();
      const sourceTranslation = sourceMap.get(wordIdStr);
      const targetTranslation = targetMap.get(wordIdStr);

      if (sourceTranslation && targetTranslation) {
        return {
          _id: word._id,
          identifier: word.identifier,
          class: word.class,
          category: word.category,
          sourceTranslation: {
            _id: sourceTranslation._id,
            translation: sourceTranslation.translation,
            language: sourceTranslation.language
          },
          targetTranslation: {
            _id: targetTranslation._id,
            translation: targetTranslation.translation,
            language: targetTranslation.language
          }
        };
      }
      return null;
    }).filter(word => word !== null);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    res.json({
      vocabulary: vocabulary,
      pagination: {
        currentPage: pageNume,
        nextPage: hasMore ? pageNume + 1 : null,
        totalPages,
        totalItems,
        hasMore
      }
    });
  } catch (e) {
    console.error("Error fetching vocabulary:", e);
    res.status(500).json({ error: "Failed to fetch vocabulary" });
  }
});

// Get a single word by ID
app.get('/api/words/:id', async (req, res) => {
  try {
    const word = await Word.findById(req.params.id).populate('category').populate('class');
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
    const words = await Word.find({})
      .populate('category')
      .populate('class');
    res.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});


// Get a all translations by language
app.get('/api/translations/:languageId', async (req, res) => { // TODO: change to short_name
  try {
    const translations = await Translation.find({ language: req.params.languageId }).populate('language');
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
    const translations = await Translation.find({}).populate('language').populate('word_id');
    res.json(translations);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Failed to fetch translations" });
  }
});

app.get('/api/languages/:short_name', async (req, res) => {
  try {
    const language = await Language.findOne({ short_name: req.params.short_name });

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
    const languages = await Language.find({});
    res.json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
})

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/classes/:id', async (req, res) => {
  try {
    const singleClass = await Class.findById(req.params.id);
    if (!singleClass) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(singleClass);
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({ error: "Failed to fetch class" });
  }
})

app.get('/api/classes', async (req, res) => {
  try {
    const classes = await Class.find({});
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500), json({ error: 'Failed to fetch classes' })
  }
})
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Handle application shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});
