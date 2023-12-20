//middleware/verifySignUp.js
const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateEmailAndUsername = (req, res, next) => {
  // Email
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(userByEmail => {
    if (userByEmail) {
      res.status(409).send({
        status: 409,
        message: "Failed! Email is already in use!"
      });
      return;
    }

    // Username
    User.findOne({
      where: {
        username: req.body.username
      }
    }).then(userByUsername => {
      if (userByUsername) {
        res.status(409).send({
          status: 409,
          message: "Failed! Username is already in use!"
        });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateEmailAndUsername: checkDuplicateEmailAndUsername,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;


