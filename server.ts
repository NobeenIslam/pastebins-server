import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import filePath from "./filepath";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);

client.connect();

app.get("/", async (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

app.get("/pastes", async (req, res) => {
  try {
    const dbres = await client.query('select * from pastebins');
    res.status(200).json(dbres.rows);
  } catch (error) {
    console.log(error)
  }

});

app.get("/pastes/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  const selectQueryId = `
  SELECT * from pastebins
  WHERE id = $1
  `
  try {
    const dbres = await client.query(selectQueryId, [id]);
    res.status(200).json(dbres.rows);
  } catch (error) {
    console.log(error)
  }
});

app.post<{},{},{title: string|null, text:string}>("/pastes", async (req,res) => {
  let {title, text} = req.body;
  if (text){
    if (title === ""){
      title = null
    }
    const postquery = `INSERT INTO pastebins (title, text) VALUES ($1, $2)`
    const postedQuery = await client.query(postquery, [title, text])
    res.status(200).json( 
      {status: "success",
      data: {
        info: postedQuery.rows,
      }})
  } else {
    res.status(500).send("Error 500: No paste text detected")
  }
})


app.delete("/pastes/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const query = `DELETE FROM pastebins WHERE id = $1 RETURNING *`
    const deleteRes = await client.query(query, [id])
    const didRemove = deleteRes.rowCount === 1;

    if (didRemove) {
      res.status(200).json({
        success: true,
        deleted: deleteRes.rows
      })
    } else {
      res.status(404).json({
        status: false,
        data: {
          id: "Could not find a paste with that id",
        },
      });
    }
  } catch (error) {
    res.status(400).send(error)
  }
})

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
