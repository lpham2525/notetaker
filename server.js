const express = require("express");
const { join } = require("path");
const app = express();
const fs = require("fs");
const { promisify } = require("util");
const wf = promisify(fs.writeFile);
const rf = promisify(fs.readFile);
let idTracker = 0;

app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//HTML route to return the "index.html" file
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "./public/index.html"));
});

//HTML route to return the "notes.html" file
app.get("/notes", (req, res) => {
  res.sendFile(join(__dirname, "./public/notes.html"));
});

//route to read the notes stored in the db.json file and display the notes in json format
app.get("/api/notes", (req, res) => {
  rf("./db/db.json", "utf-8")
    .then((notesList) => {
      notesList = JSON.parse(notesList);
      res.json(notesList);
    })
    .catch((err) => console.error(err));
});

//receives a new note to save on the request body, adds it to the`db.json` file, and then returns the new note to the client.
app.post("/api/notes", (req, res) => {
  let { title, text } = req.body;
  let newNote = { title, text, id: idTracker };
  idTracker++;
  rf("./db/db.json", "utf-8")
    .then((notesList) => {
      notesList = JSON.parse(notesList);
      notesList.push(newNote);
      wf("./db/db.json", notesList);
      res.json(notesList);
    })
    .catch((err) => console.error(err));
});

//deletes selected note using the note's id, reassigns a new id to each of the notes
app.delete("/api/notes/:id", (req, res) => {
  let id = req.params.id;
  console.log(id);
  rf("./db/db.json", "utf-8")
    .then((notesList) => {
      notesList = JSON.parse(notesList);
      notesList.splice(id, 1);
      let reAssignID = (index) => {
        for (let i = index; i < notesList.length; i++) {
          notesList[i].id = i;
        }
      };
      wf("./db/db.json", notesList)
        .then(() => {
          res.send(notesList);
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
});

app.listen(3000, () => console.log("http://localhost:3000"));
