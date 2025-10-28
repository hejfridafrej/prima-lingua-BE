# Prima Lingua Backend

REST API for the [Prima Lingua language learning application](https://github.com/hejfridafrej/prima-lingua). Serves vocabulary data with translations in multiple languages.

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB Atlas** - Cloud database
- **MongoDB Native Driver** - Database connection

## Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Create `.env` file:
   ```bash
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=3000
   ```

3. **Run locally**
   ```bash
   npm start
   ```

   API available at `http://localhost:3000/api`

## API Endpoints

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | `/api/words`                    | Get all words                  |
| GET    | `/api/words/:id`                | Get word by ID                 |
| GET    | `/api/translations`             | Get all translations           |
| GET    | `/api/translations/:language`   | Get translations by language   |
| GET    | `/api/languages`                | Get all available languages    |
| GET    | `/api/languages/:languageName`  | Get language by name           |
| GET    | `/api/categories`               | Get all available categories   |
| GET    | `/api/categories/:categoryName` | Get category by name           |
| GET    | `/api/classes`                  | Get all available classes      |
| GET    | `/api/classes/:className`       | Get class by name              |

## Data Models

**Word**
```javascript
{
  _id: ObjectId,
  identifier: String,  // English word
  class: String,       // verb, noun, adjective
  category: String     // Animals, Body, Home, etc.
}
```

**Translation**
```javascript
{
  _id: ObjectId,
  word_id: ObjectId,   // Reference to Word
  language: String,    // Language name (English, Spanish, Swedish)
  translation: String
}
```

**Language**
```javascript
{
  short_name: String,  // ISO code (primary key)
  name: String,        // Display name
  enabled: Boolean
}
```

**Class**
```javascript
{
  name: String,        // Display name
  description: String,
  enabled: Boolean
}
```

**Category**
```javascript
{
  name: String,        // Display name
  description: String,
  enabled: Boolean
}
```

## Related
- **Webb app**: [Prima Lingua] (https://prima-lingua.onrender.com)
- **Frontend Repository**: [prima-lingua-frontend](https://github.com/hejfridafrej/prima-lingua)
- **Database**: MongoDB Atlas

---

Built for Prima Lingua language learning app.