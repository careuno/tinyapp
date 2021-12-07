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

const bodyParser = require("body-parser"); //converts the request body from a buffer (sent via POST method) into a string to read, then it will add the data to the req(request) object under the key body/ 
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "7het6D": "https://web.compass.lighthouselabs.ca/days/w03d2/activities/485",
  "3hdk4e": "https://marketplace.visualstudio.com/items?itemName=shardulm94.trailing-spaces"
};

//notice the line of code that registers a handler on the root path, '/' 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase
  }; // ASK MENTOR- urlDatabase is already an object.. why must be put into another object?
  res.render("urls_index", templateVars); // this is passing in our database "urlDatabse" to render
});

app.get("/u/:shortURL", (req, res) => {  // ":" variable/parameter in a URL, since it's a .get, you are requesting so the parameters you want to access are in req
  const longURL = urlDatabase[req.params.shortURL]  //when inputting url from browser it must start with http:// for it to redirect properly
  res.redirect(longURL);        //shortURL is inside req.param
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;    //assigning shortURL to the object with the longURL           
  res.redirect(`/urls/${shortURL}`); //req.body prints {longURL: 'with whatever is inputted from the browser in the input field'}
  //-> http://localhost:8080/urls/b2xVn2
});                       //It's being parsed into a JS object where longURL is the key inside request? (with the use of bodyParser); 

app.post("/urls/:shortURL/delete", (req, res) => {
  let URLtoDelete = req.params.shortURL;
  delete urlDatabase[URLtoDelete];  //--->  urlDatabase["b2xVn2"] = "http://www.lighthouselabs.ca"... delete "http://www.lighthouselabs.ca"// show where you want to delete it from   
  res.redirect("/urls/"); 
});                   

//routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
  res.render("urls_new");  // requesting to go to /urls/new route and we are going to render the .ejs file urls_new
});


app.get("/urls/:shortURL", (req, res) => {    //after clicking submit app.post triggers and then you are redirected to a new page here that requests html and you can see the html at urls_show.ejs
//->http://localhost:8080/urls/b2xVn2
// ->req.params.shortURL = b2xVn2
// we want shortURL + longURL, but we only have shortURL, which is -> b2xVn2
// to find longURL, we are looking it up from our database. which is -> urlDatabase[b2xVn2]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //reason why we put these two into an object -> because we need to pass it to the ejs file as an object so the file can access it
  
  res.render("urls_show", templateVars); //http://localhost:8080/urls/7017cf on this page you want to render the longURL and shortURL so that is why you define it w/TemplateVars
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//adding additional endpoints - reason we are doing this is to translate and exporting out database in HTML 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//responses can contain HTML code that will render in client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});