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

const bodyParser = require("body-parser"); //converts the request body from a buffer (sent via POST method) into a string to read, then it will add the data to ethe req(request) object under the key body/ 
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
}

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

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString;
  res.send(`/urls/:${shortURL}`); // Respond with 'Ok' (we will replace this) //req.body prints {longURL: 'with whatever is inputted from the browser in the input field'}
  urlDatabase[shortURL] = req.body.longURL;               
});                       //It's being parsed into a JS object where longURL is the key; 

//routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
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