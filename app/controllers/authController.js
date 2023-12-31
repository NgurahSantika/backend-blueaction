//controllers/authController.js
const db = require("../models");
const config = require("../config/authConfig");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");



exports.signup = (req, res) => {
  
  const { password } = req.body;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!req.body.email.match(emailRegex)) {
    return res.status(400).send({
      status: 400,
      message: "Invalid email format."
    });
  }

  if (password.length < 8) {
    return res.status(400).send({ 
      status: 400,
      message: "Password should be at least 8 characters long."
    });
  }

  if (!password.match(passwordRegex)) {
    return res.status(400).send({
      status: 400,
      message: "Password should contain both letters and numbers."
    });
  }

  

  User.create({
    username: req.body.username,
    fullName: req.body.fullName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.status(201).send({ 
              status: 201,
              message: "User registered successfully!"
            });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.status(201).send({ 
            status: 201,
            message: "User registered successfully!"
          });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ 
        status: 500,
        message: err.message
      });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ 
          status: 404,
          message: "User Not found."
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(400).send({
          status: 400,
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id },
                              config.secret,
                              {
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: 86400, // 24 hours
                              });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        console.log('Authorities:', authorities); // Tambahkan log ini
        res.status(200).send({
          status: 200,
          id: user.id,
          message: "logged successfully",
          accessToken: token,
          authorities: authorities // Pastikan authorities dikirimkan
        });
      });
    })
    .catch(err => {
      res.status(500).send({ 
        status: 500,
        message: err.message
       });
    });
};

