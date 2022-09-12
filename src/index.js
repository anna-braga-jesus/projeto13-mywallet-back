import express from "express";
import cors from "cors";
import db from "./database/db.js";
import {
  createParticipant,
  LogOut,
  Login,
} from "./controllers/participant.controller.js";
import {
  createCash,
  transactions,
  deleteCash
} from "./controllers/account.controller.js";
const app = express();

app.use([cors(), express.json()]);

//===============ROTAS DE PARTICIPANTES====================

//SIGN UP INSCREVER-SE, login e senha
//localhost:5000/sign-up
app.post("/sign-up", createParticipant);

// SIGN IN ENTRAR
//Se o login for feito com sucesso, você tem um token
app.post("/sign-in", Login);


//===============ROTAS DAS TRANSAÇOES ====================

//LISTA DE PRODUTOS DO USUÁRIO , mudar para entradas, recebendo-as,
// Rota privada, só usuários logados
app.get("/transactions", transactions);

//TELA DE INSERIR NOVA ENTRADA/SAIDA createCashInflows
app.post("/transactions", createCash);

//BONUS APAGAR REGISTROS
app.delete("/transactions", deleteCash)

//BONUS EDITAR REGISTROS
app.put("/records/:id", async (req, res) => {
  const { body } = req.body;
  const { headers } = req.headers;
  const { query } = req.query;

  try {
    //1º Pegar o documento na coleção e verificar se ele existe, é um getById
    const sessions = await db.collection("sessions").findOne({});

    //2º Com o id recebido, atualize o documento , através do que o user preencher no
    //     //formulario (vulgo: req.body)

         db
           .collection("sessions")  
           .updateOne('_id: ObjectId(query.ID)', { $set: {"value":parseFloat(body.value).toFixed(2), 'description': body.description} });
        return res.status(200).send("Transação atualizada");
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }

  //   const idMensagem = req.params.id;
  //   const { to, text, type } = req.body;
  //   const { User } = req.headers;
  // console.log(idMensagem)
  //   try {
  //
  //     const message = await db
  //       .collection("messages")
  //       .findOne({ _id: ObjectId(idMensagem) });

  //     if (!message) {
  //       res.status(400).send("Essa mensagem não existe");
  //       return;
  //     }

  //
  //   } catch (error) {
  //     res.status(500).send(error.message);
  //   }
});

//DESLOGAR USUÁRIO DE TEMPOS EM TEMPOS
app.get("/sign-out", LogOut);

app.listen(5000, () => console.log("Listening on port 5000..."));
