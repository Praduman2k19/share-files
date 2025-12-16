const express = require("express");

const path = require("path");
const app = express();
const PORT = 3000;

// 👇 Important for pkg
const basePath = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

// EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// Route
app.get("/", (req, res) => {
  res.render("index", {
    title: "My First Node EJS Website",
    name: "Praduman"
  });
});

// Start server
app.listen(PORT, async () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`Server running on ${url}`);

  // ✅ Correct way to use open
//   const open = (await import("open")).default;
//   open(url);
});
