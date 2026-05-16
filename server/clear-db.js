const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
async function clear() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");
  const users = mongoose.connection.collection('users');
  await users.deleteMany({ email: "test@peblo.com" });
  const notes = mongoose.connection.collection('notes');
  await notes.deleteMany({});
  console.log("Cleared test user and all notes");
  process.exit(0);
}
clear();
