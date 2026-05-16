## Database Schema

### User
```javascript
{
  name: String, // (required)
  email: String, // (required, unique)
  password: String, // (hashed with bcrypt)
  timestamps: true
}
```

### Note
```javascript
{
  userId: ObjectId, // (ref: User)
  title: String, // (default: "Untitled")
  content: String, // (HTML from rich text editor)
  tags: [String],
  category: String,
  isArchived: Boolean, // (default: false)
  isPublic: Boolean, // (default: false)
  isPinned: Boolean, // (default: false)
  shareId: String, // (unique, sparse)
  aiSummary: String,
  aiActionItems: [String],
  aiSuggestedTitle: String,
  aiUsageCount: Number, // (default: 0)
  timestamps: true
}
```
