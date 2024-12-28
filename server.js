const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Install this package for unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// HTML Routes
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// API Routes
app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading notes:", err);
      res.status(500).json({ error: "Failed to read notes" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).json({ error: "Note title and text are required" });
  }

  const newNote = {
    id: uuidv4(),
    title,
    text,
  };

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading db.json:", err);
      res.status(500).json({ error: "Failed to read notes" });
    } else {
      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile(
        path.join(__dirname, "db/db.json"),
        JSON.stringify(notes, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to db.json:", writeErr);
            res.status(500).json({ error: "Failed to save note" });
          } else {
            console.log("Note saved:", newNote);
            res.json(newNote);
          }
        }
      );
    }
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading db.json:", err);
      res.status(500).json({ error: "Failed to read notes" });
    } else {
      const notes = JSON.parse(data);
      const filteredNotes = notes.filter((note) => note.id !== id);

      fs.writeFile(
        path.join(__dirname, "db/db.json"),
        JSON.stringify(filteredNotes, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to db.json:", writeErr);
            res.status(500).json({ error: "Failed to delete note" });
          } else {
            res.json({ message: "Note deleted" });
          }
        }
      );
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
