import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://fejesgergorichard_db_user:qqtxGzEFoUJ9bPyl@cluster0.nzuta4x.mongodb.net/?appName=Cluster0?retryWrites=true&w=majority";
const DB_NAME = process.env.DB_NAME || "palworld";

let client: MongoClient;
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return client.db(DB_NAME);
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas");
    return client.db(DB_NAME);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export async function getPals() {
  const db = await connectToDatabase();
  const palsCollection = db.collection("pals");
  return await palsCollection.find({}).toArray();
}

export async function getPassives() {
  const db = await connectToDatabase();
  const passivesCollection = db.collection("passives");
  return await passivesCollection.find({}).toArray();
}

export async function updateAllPals(palsData: any[]) {
  const db = await connectToDatabase();
  const palsCollection = db.collection("pals");
  
  // Clear the entire collection
  await palsCollection.deleteMany({});
  
  // Insert all pals
  if (palsData.length > 0) {
    await palsCollection.insertMany(palsData);
  }
  
  console.log(`✅ Updated ${palsData.length} pals in database`);
  return { success: true, count: palsData.length };
}

export async function seedDatabase() {
  const db = await connectToDatabase();
  
  const palsData = await Bun.file("src/data/pals.json").json();
  const passivesData = await Bun.file("src/data/passives.json").json();

  await db.collection("pals").deleteMany({});
  await db.collection("passives").deleteMany({});

  await db.collection("pals").insertMany(palsData);
  await db.collection("passives").insertMany(passivesData);

  console.log("✅ Database seeded successfully");
}

export async function closeDatabaseConnection() {
  if (isConnected) {
    await client.close();
    isConnected = false;
    console.log("🔌 MongoDB connection closed");
  }
}