import dayjs from "dayjs";
import Joi from "joi";
import { ObjectId } from "mongodb";
import db from "../database/db.js";

 const accountSchema = Joi.object({
  value: Joi.number().min(0.01).required(),
  description: Joi.string().trim().required(),
  //type: Joi.string().valid("credit", "debit").required(),
});

 async function createCash(req, res) {
  //const token = authorization?.replace("Bearer ", "");
   let { description, value, type } = req.body;
   let { authorization } = req.headers;
   value = Number(value).toFixed(2);
   //const User = await db.collection("users").findOne({ email });
  
   const validation = accountSchema.validate(req.body, 
     { abortEarly: false});
  const session = await db.collection("sessions").findOne( { token: authorization.replace("Bearer ", "") });
  console.log(session, 'esse aqui é o session')
  if(!description || !value){
    return res.status(500).send("Deu ruim");
  }
  
   const transaction = {
     date: dayjs().format("D/M"),
     description,
     value,
     userId: ObjectId(session.userId),
     type
   };

   try {
    // if(!token){
    //   return res.sendStatus(401);
    // }
    if(!validation){
      return res.sendStatus(422);
    }
   if (!session) {
     return res.status(401).send({ message: "O usuário não está logado" });
   }
     console.log( "Incluído com sucesso!");
    
     await db.collection("transactions").insertOne(transaction);
     res.status(201).send("Mensagem enviada com sucesso!");
   } catch (error) {
     console.log(error)
     res.status(422).send({ message: error.message });
   }
 }

async function transactions (req, res) {
  const  headers  = req.headers;
  console.log(headers.token)
  //.authorization?.replace("Bearer ", "");
  if (!headers.token) {
    return res.sendStatus(401);
  }

  try {
    const session = await db.collection("sessions").findOne({
      token:headers.token 
      
    });
    if (!session) {
      return res.sendStatus(401);
    }
    //USERS
    const user = await db.collection("users").findOne({
      _id: session.userId,
    });

    //TRANSACTIONS
    const transactions = await db
      .collection("transactions")
      .find({
        userId: user._id,
      })
      .toArray();

       // const t = transactions.reduce( transaction => {
    //   if( transaction.type === 'debit'){
    //     return ( {
    //       ...transaction,
    //       value: transaction.value * -1,
    //     }
    //   )
    // }
    // return transaction
    // })

    //transactions.REDUCE

    //console.log(t)


    return res.send(transactions);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
}

async function deleteCash (req, res){
  const { user, token, id} = req.headers;
  console.log(id, "esse é o id")
  try {
   await db.collection("transactions").deleteOne({
    _id: ObjectId(id),
    //userId: ObjectId(user)
   });
  
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
  
}
export { createCash, transactions, deleteCash };
