import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority";
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
  
  await palsCollection.deleteMany({});
  
  if (palsData.length > 0) {
    await palsCollection.insertMany(palsData);
  }
  
  console.log(`✅ Updated ${palsData.length} pals in database`);
  return { success: true, count: palsData.length };
}

export async function getCapturedPals(userId: string) {
  const db = await connectToDatabase();
  const capturedCollection = db.collection("captured");
  
  const result = await capturedCollection.findOne({ userId: userId });
  return result ? result.pals : [];
}

export async function saveCapturedPals(userId: string, capturedData: any[]) {
  const db = await connectToDatabase();
  const capturedCollection = db.collection("captured");
  
  await capturedCollection.updateOne(
    { userId: userId },
    { 
      $set: { 
        pals: capturedData, 
        updatedAt: new Date() 
      } 
    },
    { upsert: true }
  );
  
  console.log(`✅ Saved ${capturedData.length} captured pals for user ${userId}`);
  return { success: true, count: capturedData.length, userId: userId };
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