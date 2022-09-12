import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

//Conexão com o mongodb
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  console.log("MongoDB conectado!");
} catch (error) {
  console.log(error.message);
}

const db = mongoClient.db("wallet");

export default db;
