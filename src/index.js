//import "dotenv/config";
import express from "express";
import cron from "node-cron";
import { getSantaJoana } from "./routes/index";
const app = express();

app.use(express.json({ limit: "1000mb" }));

// cron.schedule("* * * * *", async (req, res) => {
//   console.log("Executando a tarefa a cada 1 minuto ### INTERNAÇÃO PROD");
//   const json = await getSantaJoana();
//   console.res.json(json);
//   return res.json(json);
// });

app.get("/santa-joana", async (req, res) => {
  const json = await getSantaJoana();
  return res.json(json);
});

app.listen(9595, (err, data) => {
  console.log("Ouvindo na porta 9595 ### INTERNAÇÃO PROD");
});

export default app;
