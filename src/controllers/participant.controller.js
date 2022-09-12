import Joi from "joi";
import bcrypt from "bcrypt";
import db from "../database/db.js";
import { v4 as uuidv4 } from "uuid";

export const newParticipantSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().min(1).required(),
  password: Joi.string().min(6).required(),
  repeat_password: Joi.string().valid(Joi.ref("password")).required(),
});

export const participantSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

async function createParticipant(req, res) {
  const { email, name, password, repeat_password } = req.body;

  if (!email || !name || !password ||repeat_password) {
    return res.sendStatus(400);
  }

  const hashPassword = bcrypt.hashSync(password, 10);

  try {
    await db.collection("users").insertOne({
      email,
      name,
      password: hashPassword,
      repeat_password
    });
    return res.sendStatus(201);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function Login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.sendStatus(400);
  }

  try {
    const user = await db.collection("users").findOne({ email: email });
    console.log(user);
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      return res.sendStatus(401);
    }

    const token = uuidv4();
    db.collection("sessions").insertOne({
      token,
      userId: user._id,
    });

    return res.send(token);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
  
}

async function LogOut(req, res) {
  //Rota privada pq precisa estar logado
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    await db.collection("sessions").deleteOne({
      token,
    });
    return res.send("Deslogado");
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}
export { createParticipant, Login, LogOut };
