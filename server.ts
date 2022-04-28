import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import filePath from "./filepath";
import { pasteInterface } from "./pasteInterface";

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
  const pathToFile = filePath("./public/index.html");
  res.sendFile(pathToFile);
  //res.status(200).send("This is the home page")
});

app.get("/pastes", async (req, res) => {
  try {
    const dbres = await client.query('select * from pastebins ORDER BY creationdate DESC ');
    res.status(200).json(dbres.rows);
  } catch (error) {
    console.log(error)
  }
});

app.get<{ id: string }, {}, {}>("/pastes/:id", async (req, res) => {
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

app.post<{}, {}, pasteInterface>("/pastes", async (req, res) => {
  let { title, text } = req.body;
  if (text) {
    if (title === "") {
      title = null
    }
     const postquery = `INSERT INTO pastebins (title, text) VALUES ($1, $2) RETURNING *`
    const postedQuery = await client.query(postquery, [title, text])
    res.status(200).json(
      {
        status: "success",
        data: {
          info: postedQuery.rows,
        }
      })
  } else {
    res.status(500).send("Error 500: No paste text detected")
  }
})

app.put<{ id: string }, {}, pasteInterface>("/pastes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    let { text, title } = req.body
    if (!text) {
      res.status(500).send("Error 500: No paste text detected")
    } else if (title === "" || !title) {
      title = null
    }
    const query = `
      UPDATE pastebins
      SET text = $1, title = $2
      WHERE id = $3
      RETURNING *
      `
    const updateResponse = await client.query(query, [text, title, id])
    const didUpdate = updateResponse.rowCount === 1;

    if (didUpdate) {
      res.status(200).json({
        success: true,
        updated: updateResponse.rows
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

//delete paste
app.delete<{ id: string }, {}, {}>("/pastes/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const query = 'DELETE FROM pastebins WHERE id = $1 RETURNING *'
    const deleteRes = await client.query(query, [id])
    const didRemove = deleteRes.rowCount === 1;

    const commentRes = await client.query(`DELETE FROM comments WHERE paste_id = $1`, [id])

    if (didRemove) {
      res.status(200).json({
        success: true,
        deletedPaste: deleteRes.rows,
        deletedComment: commentRes.rows
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
    res.status(400).send("error catch activated")
  }
})

//add comment
app.post<{id: string}, {}, {comment: string}>("/pastes/:id/comments", async (req,res) => {
  const id = parseInt(req.params.id)
  let {comment} = req.body

  try {
    const query = 'INSERT INTO comments (paste_id, comment) VALUES ($1, $2) RETURNING *'

    if (comment === "" || comment === null){
      res.status(404).send("No content in comment")
    } else {
      const queryRes = await client.query(query, [id, comment])
      res.status(200).json({
        status: "success",
        data: queryRes.rows
      })
    }
  }
  catch (error){
    res.status(400).send(error)
  }
})

//get comment
app.get<{id: string}>("/pastes/:id/comments", async (req,res) => {
  const id = parseInt(req.params.id)

  try {
    const query = 'SELECT * FROM comments WHERE paste_id= $1'
    const queryRes = await client.query(query, [id])

    res.status(200).json(queryRes.rows)
    
  } catch (error) {
    res.status(400).send(error)
  }
})

//delete comment
app.delete<{id: string}, {}, {}>("/pastes/comments/:id", async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const query = 'DELETE FROM comments WHERE id= $1 RETURNING *'
    const deleteRes = await client.query(query, [id])
    const didRemove = deleteRes.rowCount === 1
  
  if (didRemove) {
    res.status(200).json({
      success: true,
      deleted: deleteRes.rows
    })
  } else {
    res.status(404).json({
      status: false,
      data: {
        id: "Could not find a comment with that id",
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