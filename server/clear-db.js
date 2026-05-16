const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://mdzeeshan08886_db_user:Zeeshan@cluster0.gpczr10.mongodb.net/?appName=Cluster0";

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
