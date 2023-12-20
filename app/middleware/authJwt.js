//middleware/authJwt.js
const jwt = require("jsonwebtoken");
const config = require("../config/authConfig");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      status: 403,
      message: "No token provided!"
    });
  }

  jwt.verify(token,
            config.secret,
            (err, decoded) => {
              if (err) {
                return res.status(401).send({
                  status: 401,
                  message: "Unauthorized!",
                });
              }
              req.userId = decoded.id;
              next();
            });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        status: 403,
        message: "Require Admin Role!"
      });
      return;
    });
  });
};
// tambahan
exports.isAdmin = (req, res, next) => {
  // Periksa peran pengguna dari token JWT
  const roles = req.user.roles.map(role => role.name);

  if (roles.includes('ROLE_ADMIN')) {
    next();
    return;
  }

  res.status(403).send({
    status: 403,
    message: 'Require Admin Role!'
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
module.exports = authJwt;
