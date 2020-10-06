const User = require('../../models/user');
const validator = require("email-validator");
const bcrypt = require('bcrypt');

const addUser = (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const address = req.body.address;
    const telephone = req.body.telephone;
    const organisation = req.body.organisation;
    const role = 'user';
    if (!firstname || !lastname || !email || !password || !address || !telephone || !organisation) {
        res.status(400).json({
            message: 'All fields are mandatory !'
        })
    } else if (validator.validate(email) === false) {
        res.status(400).json({
            message: 'Invalid email format !'
        })
    } else if (password.length < 8) {
        res.status(400).json({
            message: 'Password should be at least 8 character !'
        })
    } else {
        bcrypt.genSalt(saltRounds, function (erreur, salt) {
            if (erreur) {
                res.json({err: erreur});
            } else {
                bcrypt.hash(password, salt, function (error, hash) {
                    const user = new User({
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        password: hash,
                        address: address,
                        telephone: telephone,
                        organisation: organisation,
                        photo: null,
                        photoLocation: null,
                        role: 'user',
                    });
                    var dataArray = [];
                    User.find({email: email}, function (err, foundData) {
                        dataArray.push(foundData);
                        console.log(dataArray);
                        if (foundData.length > 0) {
                            res.status(400).json({
                                message: 'this account with email: ' + email + ' exist'
                            })
                        } else {
                            user.save(function (err, savedUser) {
                                if (err) {
                                    res.status(500).json({
                                        message: err
                                    })
                                } else {
                                    res.json({
                                        user: user,
                                        success: 'Success !'
                                    })
                                }
                            });
                        }
                    });
                })
            }
        })
    }
};

module.exports = addUser;