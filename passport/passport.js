const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bCrypt = require("bcrypt");
const User = require("../models/user");

const isCredencialesOk = (user, password) =>
  bCrypt.compareSync(password, user.password);
const createHashPaswword = (password) =>
  bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);

passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/login/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      const user = {
        _id: profile.id, 
        userName: profile.displayName
      }
      return done(null, user);
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    async function (req, username, password, done) {
      try {
        const user = await User.findOne({ username: username });
        if (!user) return done(null, false);
        if (!isCredencialesOk(user, password)) return done(null, false);
        return done(null, user);
      } catch (err) {
        throw err;
      }
    }
  )
);

passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      findOrCreateUser = async function () {
        try {
          const user = await User.findOne({ username: username });
          if (user) return done(null, false);
          const newUser = new User({
            username: username,
            password: createHashPaswword(password),
          });
          await newUser.save();
          return done(null, user);
        } catch (err) {
          throw err;
        }
      };
      process.nextTick(findOrCreateUser);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  try {
    done(null, user);
  } catch (err) {
    throw err;
  }
});
