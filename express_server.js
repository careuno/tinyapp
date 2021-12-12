//----------------TINYAPP PROJECT----------------------------------------------

const {findUserByEmail} = require("./helpers");

const express = require("express");
const app = express();
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

//--------------- MIDDLEWARE --------------------------------------------------
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const bodyParser = require("body-parser"); //converts the request body from a buffer (sent via POST method) into a string to read, then it will add the data to the req(request) object under the key body/
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: "session",
  keys: ["I like potatoes and cheese","key"]
}));

//--------------- DATABASE & HELPER FUNCTIONS ------------------------------------

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
};

// Function to generate random 6 character string for the short URL.
const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
};

// Function to pass error messages with HTML with either or "Login / Sign UP".
const errorLoginSignUpLink = function(errorMsg) {
  return `<div style="padding-top: 80px;"><style> body { background-color: #4ba0b5;} </style><h1 style="color: #FFFFFF;font-size:60px;font-family:helvetica;text-align:center;margin:30px;">${errorMsg}<br><br><a href=/login style="color: #FFFFFF;"> Login</a> / <a href=/register style="color: #FFFFFF;">Sign Up</a></h1></div>`;
}; 

// Function to pass error messages with HTML with either "Return to homepage".
const errorReturnHome = function(errorMsg) {
  return `<div style="padding-top: 80px;"><style> body { background-color: #4ba0b5;} </style><h1 style="color: #FFFFFF;font-size:60px;font-family:helvetica;text-align:center;margin:30px;">${errorMsg}<br><br><a href=/urls style="color: #FFFFFF;"> Return to TinyApp homepage. </a></h1>`;
}; 

// Function to filter out URLs from the database and send only the URLs that correlate to user. See app.get("/urls")
const urlsForUser = function(id) {
  const userURLObj = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl]['userID'] === id) {
      const longURL = urlDatabase[shortUrl]['longURL'];
      userURLObj[shortUrl] = { longURL, id };
    }
  }
  return userURLObj;
};


//--------------- MAIN  / -------------------------PUBLIC ACCESS--------------------------
app.get("/", (req, res) => {
   //NOTE: Currently no persisting database if server shuts down
   //You can have cookies with no matching user data in this project if you restart the server but not log out from the browser

   //Checking whether you are logged in checks for cookie + data in database
   const userCookieID = req.session["user_id"];
   const loggedInUser = users[userCookieID]; 

        //Current situation (no persisting data): 
        //----- if cookie but (restart server) no data ===> no user therefore need to act as if not logged in + NOT EVEN REGISTERED ---> return res.redirect("/register"); (makes more sense but COMPASS says redirect to /login)
        
        //Future situation (persisting data):
        //----- if cookie but (restart server) yes data ===> return res.redirect("/login"); and or redirect to ("/urls") since you are logged in. 

        //Future situation (persisting data):
        //----- if no cookie but data in database (say they deleted cookies/cache etc.) ===> we don't know the user is who they say they are, unless there is a cookie so we give them BOTH options LOGIN / SIGN UP so they can choose. 

  if (!loggedInUser) {  //if there is no cookie/and no data.. should redirect to /register but COMPASS said redirect to /login 
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

//--------------- MAIN /urls -------------------------PUBLIC ACCESS--------------------------
app.get("/urls", (req, res) => {
  const userCookieID = req.session.user_id;
  const loggedInUser = users[userCookieID];
  const templateVars = { urls: urlsForUser(userCookieID), user: loggedInUser };
  res.render("urls_index", templateVars);
});

//----------- PAGE: whenever you request shortURL in browser---------PUBLIC ACCESS-----------
app.get("/u/:shortURL", (req, res) => {  //COMPASS requirements page named this u/:id, changed for clarity
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) { 
    const errorMsg = 'ERROR 404: This URL shortcut does not exist.'
    return res.status(403).send(errorReturnHome(errorMsg));
  } else {
    const longURL = urlDatabase[shortURL]["longURL"];
    return res.redirect(longURL);
  }
});

//--------------- PAGE: CREATE NEW URL ------------------USER ACCESS/COOKIE-----------------
//Here we are going to Create New URL
app.get("/urls/new", (req, res) => {
  const userCookieID = req.session["user_id"];
  const user = users[userCookieID];
  const templateVars = { user: user
  };
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);//requesting to go to /urls/new route and we are going to render the .ejs file urls_new
});

//--------------- ACTION: CREATE NEW URL ------------------USER ACCESS/COOKIE-----------------
app.post("/urls/new", (req, res) => { //decided to rename this from /urls to urls/new for my own clarity, NOTE- adjust .ejs and any curl commands to also include '/new'
  //curl -X POST -i localhost:8080/urls/new/  
  const userCookieID = req.session["user_id"];
  const loggedInUser = users[userCookieID];
  if (!loggedInUser) { 
    return res.status(403).send('ERROR 403: You must login before creating a URL.');//won't be able to see from browser so HTML is pointless and makes curl hard to read error, therefore sending a string.
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userCookieID};//assigning shortURL to the object with the longURL provided from form
  res.redirect(`/urls/${shortURL}`);
});


//--------- PAGE: SPECIFIC URL PAGE + SHOW US EDIT LINK --------USER ACCESS/COOKIE----------
app.get("/urls/:shortURL", (req, res) => {  //COMPASS requirements page named this /urls/:id
const shortURL = req.params.shortURL;
const userCookieID = req.session["user_id"];
const loggedInUser = users[userCookieID]; //send whole user object (with id, email and password associated to id key).

  //when Create New URL and clicking submit, app.post triggers and then you are redirected to a new page here that requests html at urls_show.ejs

  // TEST ------ if shortURL Edit Page doesn't exist.
  if (!urlDatabase[shortURL]) { 
    const errorMsg = 'ERROR 404: Invalid request. Link is not found.'
    return res.status(404).send(errorReturnHome(errorMsg));
  }
  
  //TEST ------- if no cookies/logged out... do not render edit page.
  if (!loggedInUser) { 
    const errorMsg = 'ERROR 403: Must log in to make edits.'
    return res.status(403).send(errorLoginSignUpLink(errorMsg));
  }
  
  // TEST ------ if shortURL DOES exist but logged in User isn't owner of that link they are trying to edit, don't render edit page.
  const ownerOfUrlID = urlDatabase[shortURL]['userID']; //'userID' refers to the ownerID associated to the URL. Used in the urlDatabase.
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL]["longURL"], user: loggedInUser};

  if (userCookieID === ownerOfUrlID) {
    return res.render("urls_show", templateVars); //http://localhost:8080/urls/7017cf on this page you want to render the longURL and shortURL so that is why you define it w/TemplateVars
  } else {
    const errorMsg = 'ERROR 403: You do not have this link saved on your account.'
    return res.status(403).send(errorReturnHome(errorMsg));
  }
});

//---------------DELETE ACTION: MAIN + DELETE + MAIN ---------------------USER ACCESS/COOKIE-----------

//TEST GUEST FROM CURL- if you use curl -X POST -i localhost:8080/urls/SHORTURL/delete .. change SHORTURL to one that exists 

app.post("/urls/:shortURL/delete", (req, res) => {
  const userCookieID = req.session["user_id"];
  const loggedInUser = users[userCookieID];
  const shortURL = req.params.shortURL;

  if (loggedInUser) {
    const ownerID = urlDatabase[shortURL]['userID'];
    if (userCookieID === ownerID) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    } else { 
      const errorMsg = 'ERROR 403: Only owner of the URLs can delete the URl.'
      return res.status(403).send(errorLoginSignUpLink(errorMsg));
    }
  } else {
    return res.status(403).send('ERROR 403: User needs to be logged in to delete URLs.'); //won't be able to see from browser so HTML is pointless and makes curl hard to read error, therefore sending a string.
  }
});

//---------------EDIT ACTION: SPECIFIC URL PAGE + EDIT-----------------USER ACCESS/COOKIE----------------
///HERE we are trying to update an edited longURL
// TEST GUEST eg. FROM CURL -X POST -i localhost:8080//urls/cbb859 (change string to one that exists in your database)

app.post("/urls/:shortURL", (req, res) => {

  const userCookieID = req.session["user_id"];
  const loggedInUser = users[userCookieID];
  const shortURL = req.params.shortURL
  if (loggedInUser) {
    const ownerOfURL = urlDatabase[shortURL]['userID'];
    if (userCookieID === ownerOfURL) {
      const newLongURL = req.body.longURL;
      urlDatabase[shortURL]["longURL"] = newLongURL;
      return res.redirect("/urls");
    } else { 
      return res.status(403).send('ERROR 403: Only the owner of the URLs can edit URLs.'); //won't be able to see from browser so HTML is pointless and makes curl hard to read error, therefore sending a string.
    }
  } else {
    return res.status(403).send('ERROR 403: User needs to be logged in to edit URLs.'); //won't be able to see from browser so HTML is pointless and makes curl hard to read error, therefore sending a string.
  }
});

//--------------- REGISTER -------------------------PUBLIC ACCESS-------------------
app.get("/register", (req, res) => {
  const userCookieID = req.session["user_id"];
  const loggedInUser = users[userCookieID];
  const templateVars = { user: loggedInUser
  };

  if (!loggedInUser) {
    return res.render("urls_register", templateVars);
  }
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    const errorMsg = 'ERROR 400: Email and password cannot be blank.'
    return res.status(400).send(errorLoginSignUpLink(errorMsg)); 
  }

  const existingUser = findUserByEmail(email, users); //checks if that user exists in the database already

  if (existingUser) {
    const errorMsg = 'ERROR 400: There is already a user signed up with that email.'
    return res.status(400).send(errorLoginSignUpLink(errorMsg));
  }

//assigning new user object to user database and hashing passwords with bcrypt.
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(password, salt)
  };

  req.session["user_id"] = randomID;
  res.redirect("urls");
});


//--------------- LOGIN / LOGOUT ------------------PUBLIC ACCESS----------------------
app.get("/login", (req, res) => {
  const userCookieID = req.session["user_id"];
  const loggedInUser = users[userCookieID]; //Note: checks if you are logged in by 1. checking cookie and 2. checking if you are in the database, if you are logged in and close server connection, cookie persists but database is reset, creating an issue when starting the server up again --> it sees cookie and thinks and behaves like logged in, when really you don't exist in database yet. 

  const templateVars = { user: loggedInUser
  };

  if (!loggedInUser) {
    return res.render("urls_login", templateVars);
  }
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) { 
    const errorMsg = 'ERROR 400: Email and/or password cannot be blank';
    return res.status(400).send(errorLoginSignUpLink(errorMsg));
  }
  const foundUser = findUserByEmail(email, users);

  if (!foundUser) {
    const errorMsg = 'ERROR 403: A user with that email does not exist.'
    return res.status(403).send(errorLoginSignUpLink(errorMsg));
  } else {
    const validPassword = bcrypt.compareSync(password, foundUser["password"]); //make sure you compare (string/plaintext, hash)
    if (!validPassword) { 
      const errorMsg = 'Error 403: Password does not match.';
      return res.status(403).send(errorLoginSignUpLink(errorMsg));
    }
  };
  //NOTES: res.cookie stored things as plain text, so we decided to store it encrypted with cookie session
  //res.cookie('user_id', user.id);
  //req.session["user_id"] = users[key].id; //why are we using req/request and not res, because we are dealing with unencrypted value and cookie-session will return it to response
  req.session["user_id"] = foundUser.id;
  res.redirect("urls");
});

app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect("/urls");
});

//--------------- OTHER COMPASS ACTIVITIES -----------------PUBLIC ACCESS---------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//adding additional endpoints - reason we are doing this is to translate and exporting out database in HTML
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //here our database is in the same file, usually it's in a different directory that you would require at the top
});             //eg. const pageText = require(./data/languages.json) brings in the .json file with the data (remember to indicate the relative path)

//responses can contain HTML code that will render in client browser, however we will keep html in templates and render those to keep code clean
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});





