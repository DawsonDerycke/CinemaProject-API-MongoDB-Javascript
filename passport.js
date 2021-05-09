const passport = require('passport');
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;
const { signature } = require('./controllers/validator');

function myPassportLocal(db) {
    const userCollection = db.collection('users');

    passport.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
    },
        async (username, password, cb) => {
            try {
                const user = await userCollection.findOne({
                    username,
                });
                if (user && bcrypt.compareSync(password, user.password)) {
                    return cb(null, user, { message: 'Logged in successfully' });
                }
            } catch (e) {
                console.log(e);
            }
            return cb(null, false, { message: 'Incorrect user or password.' });
        },
    ));
};

function myPassportJWT() {
    passport.use(
        new JWTStrategy({
            jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: signature,

        }, function (jwtPayload, cb) {
            return cb(null, jwtPayload);
        })
    );
};

module.exports = {
    myPassportLocal,
    myPassportJWT,
};