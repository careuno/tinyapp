/* TINY APP PROJECT
• Implement a basic web server using the Express.js framework.
https://web.compass.lighthouselabs.ca/days/w03d1/activities/169
• Created a web server that has different responses depending on which route you visit. 
• Learned how to test our web server using both our browser and the command line utility curl.
 */

const express = require("express");
//do we need morgan?
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser"); //converts the request body from a buffer (sent via POST method) into a string to read, then it will add the data to the req(request) object under the key body/ 
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "7het6D": "https://web.compass.lighthouselabs.ca/days/w03d2/activities/485",
  "3hdk4e": "https://marketplace.visualstudio.com/items?itemName=shardulm94.trailing-spaces"
};

const users = { 
  "u1RandomID": {
    id: "u1RandomID", 
    email: "u1@xfiles.com", 
    password: "123"
  },
 "u2RandomID": {
    id: "u2RandomID", 
    email: "u2@xfiles.com", 
    password: "abc"
  }
}

const findUserByEmail = (email) => {
 
  for(const usersKeys in users) {
    const user = users[usersKeys];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};


//notice the line of code that registers a handler on the root path, '/' 
app.get("/", (req, res) => {
  res.send("Hello!");
});

//--------------- MAIN ------------------------------------------------------------ 
app.get("/urls", (req, res) => {
  console.log('users obj',users)
  const userCookieID = req.cookies["user_id"]
  console.log('userCookieID', userCookieID)
  const user = users[userCookieID]
  console.log('user', user)
  const templateVars = {urls: urlDatabase, user: user
  }; // ASK MENTOR- urlDatabase is already an object.. why must be put into another object? So you can manipulate it 
  //console.log('templateVars',templateVars)
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

//--------------- MAIN + DELETE + MAIN ------------------------------------------------------------ 
app.post("/urls/:shortURL/delete", (req, res) => {
  let URLtoDelete = req.params.shortURL;
  delete urlDatabase[URLtoDelete];  //--->  urlDatabase["b2xVn2"] = "http://www.lighthouselabs.ca"... delete "http://www.lighthouselabs.ca"// show where you want to delete it from   
  res.redirect("/urls/"); 
});      

//--------------- SPECIFIC URL PAGE + EDIT------------------------------------------------------
///HERE we are trying to update an edited longURL 
app.post("/urls/:id", (req, res) => {
  //console.log(req.params) //{ id: '9sm5xK' }, you can see req params in this is for id
  let newLongURL = req.body.longURL
  urlDatabase[req.params.id] = newLongURL
  res.redirect("/urls/"); 
});  

//--------------- CREATE NEW URL PAGE------------------------------------------------------------ 
//routes should be ordered from most specific to least specific
//Here we are going to Create New URL
app.get("/urls/new", (req, res) => {
  const userCookieID = req.cookies["user_id"]
  const user = users[userCookieID]
  const templateVars = { user: user
  };
  res.render("urls_new", templateVars);  // requesting to go to /urls/new route and we are going to render the .ejs file urls_new
});

//--------------- SPECIFIC URL PAGE + SHOW US SPECIFIC LINK ---------------------------------------
app.get("/urls/:shortURL", (req, res) => {    //after clicking submit app.post triggers and then you are redirected to a new page here that requests html and you can see the html at urls_show.ejs
//->http://localhost:8080/urls/b2xVn2
// ->req.params.shortURL = b2xVn2
// we want shortURL + longURL, but we only have shortURL, which is -> b2xVn2
// to find longURL, we are looking it up from our database. which is -> urlDatabase[b2xVn2]

  //reason why we put these two into an object -> because we need to pass it to the ejs file as an object so the file can access it\\const userCookieID = req.cookies["user_id"]
  const userCookieID = req.cookies["user_id"]
  const user = users[userCookieID]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};

  res.render("urls_show", templateVars); //http://localhost:8080/urls/7017cf on this page you want to render the longURL and shortURL so that is why you define it w/TemplateVars
});

//--------------- REGISTER ------------------------------------------------------------    
app.get("/register", (req, res) => {
  const userCookieID = req.cookies["user_id"]
  //console.log('userCookieID', userCookieID)
  const user = users[userCookieID]
  //console.log('user', user)
  const templateVars = { user: user
  };
  res.render("urls_register", templateVars);  
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString()
  const email = req.body.email
  const password = req.body.password
  
  if (!email || !password) {
    return res.status(400).send("Error 400: Email and password cannot be blank")
  }

  const user = findUserByEmail(email)
  // const findUserByEmail = (email) => {
 

  if (user){
    return res.status(400).send("Error 400: There is already a user signed up with that email");
  }

 users[randomID] = {
      id: randomID, 
      email: req.body.email,
      password: req.body.password
    };

//console.log('users', users) 
//prints: users {
//   userRandomID: { id: 'u1RandomID', email: 'u1@xfiles.com', password: '123' },
//   user2RandomID: { id: 'u2RandomID', email: 'u2@xfiles.com', password: 'abc' },
//   iaji4j: { id: 'iaji4j', email: 'k@gmail.com', password: '123' }
// }
  res.cookie('user_id', randomID)
  res.redirect("urls"); 
});  


//--------------- LOGIN / LOGOUT ------------------------------------------------------------    
app.get("/login", (req, res) => {
  const userCookieID = req.cookies["user_id"]
  //console.log('userCookieID', userCookieID)
  const user = users[userCookieID]
  //console.log('user', user)
  const templateVars = { user: user
  };
  res.render("urls_login", templateVars);  
});

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank")
  }

  const user = findUserByEmail(email);


  if (!user){
    return res.status(403).send("Error 403: a user with that email does not exist");
  }

  if (user.password !== password) {
    return res.status(403).send('Error 403: password does not match')
  }

  res.cookie('user_id', user.id)
  res.redirect("urls"); 

});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls/"); 
});   

//--------------- OTHER COMPASS ACTIVITIES ------------------------------------------------------------    
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//adding additional endpoints - reason we are doing this is to translate and exporting out database in HTML 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //here our database is in the same file, usually it's in a different directory that you would require at the top
});                         //eg. const pageText = require(./data/languages.json) brings in the .json file with the data (remember to indicate the relative path)

//responses can contain HTML code that will render in client browser, however we will keep html in templates and render those to keep code clean
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});















// //when you manipulate arrays you need to use the spread operator bar = [...foo] to copy cause 
// //it shares 
// const foo = [1, 2];
// const bar = foo;


// bar[0] = 9;
// console.log(foo[0], bar[0]); // => 9, 9