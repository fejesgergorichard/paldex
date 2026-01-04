import { closeDatabaseConnection, seedDatabase } from "@services/mongoDataService";


await seedDatabase();
await closeDatabaseConnection();