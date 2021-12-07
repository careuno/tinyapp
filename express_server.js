/* 
• Implement a basic web server using the Express.js framework.
https://web.compass.lighthouselabs.ca/days/w03d1/activities/169

• Created a web server that has different responses depending on which route you visit. 

• Learned how to test our web server using both our browser and the command line utility curl.
 */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//notice the line of code that registers a handler on the root path, '/' 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//adding additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//responses can contain HTML code that will render in client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});