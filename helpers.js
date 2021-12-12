const findUserByEmail = (email, users) => {
 
  let foundUser = undefined;
  for (const usersKeys in users) {
    if (users[usersKeys].email === email) {
      foundUser = users[usersKeys]
    }
  }
  return foundUser;
};






module.exports = {findUserByEmail};