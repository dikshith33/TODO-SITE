import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "dikshith@123",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const type = req.query.type || "daily"; // Default to daily tasks
    const result = await db.query("SELECT * FROM items WHERE type = $1 ORDER BY id ASC", [type]);
    const items = result.rows;

    res.render("index.ejs", {
      listTitle: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize the type
      listItems: items,
      currentType: type,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const type = req.body.type || "daily"; // Default to daily tasks

  try {
    await db.query("INSERT INTO items (title, type) VALUES ($1, $2)", [item, type]);
    res.redirect(`/?type=${type}`);
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  const type = req.body.type || "daily"; // Default to daily tasks

  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [item, id]);
    res.redirect(`/?type=${type}`);
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  const type = req.body.type || "daily"; // Default to daily tasks

  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect(`/?type=${type}`);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});