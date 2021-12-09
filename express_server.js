/* TINY APP PROJECT
• Implement a basic web server using the Express.js framework with different responses depending on the route you visit.
https://web.compass.lighthouselabs.ca/days/w03d1/activities/169
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

const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
};

// const urlDatabase = { //OLD DATABASE
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "7het6D": "https://web.compass.lighthouselabs.ca/days/w03d2/activities/485",
//   "3hdk4e": "https://marketplace.visualstudio.com/items?itemName=shardulm94.trailing-spaces"
// };

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

const findUserByEmail = (email) => {
 
  for (const usersKeys in users) {
    const user = users[usersKeys];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

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

//const authenticateUser = (email, password, db) => {
// if (!potentialUser) {
//   return {err:"No user with that email", data: null};
// }
// if (potentialUser.password !== password) {
//   return {err:"Password not matching", data:null};
// }
//   return {err:null, data:potentialUser}

// };
//const result = authenticateUser(email, password, userDatabaseIsh)

/* if(result.err) {
  console.log... see Francis Lecture to understand creating a helper function we can use for TinyApp
} */


//notice the line of code that registers a handler on the root path, '/'
app.get("/", (req, res) => {
  res.send("Hello!");
});

//--------------- MAIN -------------------------PUBLIC ACCESS--------------------------
app.get("/urls", (req, res) => {
  const userCookieID = req.cookies["user_id"];
  const user = users[userCookieID];
  //const templateVars = {urls: urlDatabase, user: user
  //}; // ASK MENTOR- urlDatabase is already an object.. why must be put into another object? So you can manipulate it
  //console.log('templateVars',templateVars)

  // if user is not logged in OR accessing through curl ------> did the condition on .ejs outputting HTML message
  // if (!userCookieID) {  //doing it this way would make it difficult for new users to register or login
  //   res.status(403).send("Error 403: User needs to be logged in.")
  //} else {
  const templateVars = { urls: urlsForUser(userCookieID), user: user };
  res.render("urls_index", templateVars);
  //}
});

//----------- PAGE: whenever you request shortURL in browser---------PUBLIC ACCESS-----------
app.get("/u/:shortURL", (req, res) => {  // ":" variable/parameter in a URL, since it's a .get, you are requesting so the parameters you want to access are in req
  // console.log('urlDatabase[req.params.shortURL]', urlDatabase[req.params.shortURL])
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(403).send("Error 403: This url shortcut does not exist.");
  } else {
    const longURL = urlDatabase[shortURL]["longURL"];  //when inputting url from browser it must start with http:// for it to redirect properly
    res.redirect(longURL);        //shortURL is inside req.param
  }
});

//--------------- PAGE: CREATE NEW URL ---------------------------USER ACCESS/COOKIE-----------------
//routes should be ordered from most specific to least specific
//Here we are going to Create New URL
app.get("/urls/new", (req, res) => {
  const userCookieID = req.cookies["user_id"];
  const user = users[userCookieID];
  const templateVars = { user: user
  };
  if (!userCookieID) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);  // requesting to go to /urls/new route and we are going to render the .ejs file urls_new
});

//--------------- ACTION: CREATE NEW URL ---------------------------USER ACCESS/COOKIE-----------------
app.post("/urls/new", (req, res) => {             //I decided to rename this from /urls to urls/new for my own clarity, NOTE- adjust .ejs and any curl commands to also include '/new'
  const userCookieID = req.cookies["user_id"];
  if (!userCookieID) {
    return res.status(403).send("Error 403: You must login before creating a URL.");
  }
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userCookieID};//assigning shortURL to the object with the longURL
  console.log ('urlDatabase during post', urlDatabase)
  res.redirect(`/urls/${shortURL}`); //req.body prints {longURL: 'with whatever is inputted from the browser in the input field'}
  //-> http://localhost:8080/urls/b2xVn2
});//It's being parsed into a JS object where longURL is the key inside request? (with the use of bodyParser);


//--------- PAGE: SPECIFIC URL PAGE + SHOW US EDIT LINK --------USER ACCESS/COOKIE----------
app.get("/urls/:shortURL", (req, res) => {    //after clicking submit app.post triggers and then you are redirected to a new page here that requests html and you can see the html at urls_show.ejs
//->http://localhost:8080/urls/b2xVn2
// ->req.params.shortURL = b2xVn2
// we want shortURL + longURL, but we only have shortURL, which is -> b2xVn2
// to find longURL, we are looking it up from our database. which is -> urlDatabase[b2xVn2]

//console.log('urlDatabase during get', urlDatabase)
//TEST ------- if no cookies/logged out... do not render edit page
if (!req.cookies["user_id"]) {
  res.status(403).send("Error 403: Must log in to make edits.");
}

// TEST ------ if shortURL doesn't exist
if (!urlDatabase[req.params.shortURL]) {  //
  return res.status(403).send("Error 404: Invalid request. Link does not exist.");
}

//*** check each get request see if it behaves the way expected when logged out and what happens if you go to a bogus link while logged out or in

  //reason why we put these two into an object -> because we need to pass it to the ejs file as an object so the file can access it\\const userCookieID = req.cookies["user_id"]
  const userCookieID = req.cookies["user_id"];
  const user = users[userCookieID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: user};

  res.render("urls_show", templateVars); //http://localhost:8080/urls/7017cf on this page you want to render the longURL and shortURL so that is why you define it w/TemplateVars
});

//--[X]-------------DELETE ACTION: MAIN + DELETE + MAIN ---------------------USER ACCESS/COOKIE-----------

//x\\ GUEST FROM CURL- if you use curl -X POST -i localhost:8080/urls/sgq3y6/delete ....
//x\\ GUEST FROM BROWSER- expect

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"]) {
    const userCookieID = req.cookies["user_id"];
    const ownerID = urlDatabase[req.params.shortURL]['userID'];
    if (userCookieID === ownerID) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(403).send("Error 403: Only owner of the urls can delete the url.");
    }
  } else {
    res.status(403).send("Error 403: User needs to be logged in to delete URLs.");
  }
});

// // ---------WHY DID THIS NOT WORK??? --------------------------
// //doesn't work because it will stop at the condition statement when the cookie doesn't exist and there's no error 
// //test with bogus short URL and see what comes out in cURL
//   const URLtoDelete = req.params.shortURL;
//   if (req.cookies["user_id"] === urlDatabase[URLtoDelete]["userID"]) {
//     delete urlDatabase[URLtoDelete];  //--->  urlDatabase["b2xVn2"] = "http://www.lighthouselabs.ca"... delete "http://www.lighthouselabs.ca"// show where you want to delete it from
//     res.redirect("/urls");
//   } else {
//     res.status(403).send("Error 403: Can only delete your own URLs when logged in")
//   }
// });

//---------------EDIT ACTION: SPECIFIC URL PAGE + EDIT-----------------USER ACCESS/COOKIE----------------
///HERE we are trying to update an edited longURL

//x\\ GUEST FROM CURL- if you use curl -X POST -i localhost:8080//urls/cbb859/
//x\\ GUEST FROM BROWSER- expect

app.post("/urls/:shortURL", (req, res) => {
//   const userCookieID = req.cookies["user_id"];
//   if (userCookieID) {
//     //console.log(req.params) //{ shortURL: '9sm5xK' }, you can see req params in this is for id
//     let newLongURL = req.body.longURL;
//     urlDatabase[req.params.id]["longURL"] = newLongURL;
//     res.redirect("/urls/");
//   }
// });
  if (req.cookies["user_id"]) {
    const userCookieID = req.cookies["user_id"];
    const ownerOfURL = urlDatabase[req.params.shortURL]['userID']; //something is wrong here and sometimes it works and sometimes it doesn't.... I want this to check the uRL Database
    // console.log('ownerOfURL', ownerOfURL) //prints: u1RandomID

    if (userCookieID === ownerOfURL) {
      let newLongURL = req.body.longURL;
      urlDatabase[req.params.shortURL]["longURL"] = newLongURL;
      res.redirect("/urls");
    } else {
      res.status(403).send("Error 403: Only owner of the urls can edit the url.");
    }
  } else {
    res.status(403).send("Error 403: User needs to be logged in to edit URLs.");
  }
});

//--------------- REGISTER -------------------------PUBLIC ACCESS-------------------
app.get("/register", (req, res) => {
  const userCookieID = req.cookies["user_id"];
  //console.log('userCookieID', userCookieID)
  const user = users[userCookieID];
  //console.log('user', user)
  const templateVars = { user: user
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("Error 400: Email and password cannot be blank.");
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send("Error 400: There is already a user signed up with that email.");
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
  res.cookie('user_id', randomID);
  res.redirect("urls");
});


//--------------- LOGIN / LOGOUT ------------------PUBLIC ACCESS----------------------
app.get("/login", (req, res) => {
  const userCookieID = req.cookies["user_id"];
  //console.log('userCookieID', userCookieID)
  const user = users[userCookieID];
  //console.log('user', user)
  const templateVars = { user: user
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("Error 400: Email and password cannot be blank.");
  }

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send("Error 403: A user with that email does not exist.");
  }

  if (user.password !== password) {
    return res.status(403).send('Error 403: Password does not match.');
  }

  res.cookie('user_id', user.id);
  res.redirect("urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls/");
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
