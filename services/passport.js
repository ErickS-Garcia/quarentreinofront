const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true
    },
    async (req, username, password, done) => {
      try {
        const existingUser = await User.findOne({ email: username });

        if (!existingUser) {
          req.session.messages = [
            ...(req.session.messages || []),
            { variant: 'danger', content: 'Usuário/Senha incorretos' }
          ];
          return done(null, false);
        }

        const passwordIsCorrect = await existingUser.verifyPassword(password);

        if (passwordIsCorrect) {
          return done(null, existingUser);
        }

        req.session.messages = [
          ...(req.session.messages || []),
          { variant: 'danger', content: 'Usuário/Senha incorretos' }
        ];
        return done(null, false);
      } catch (error) {
        console.error(error);
        req.session.messages = [
          ...(req.session.messages || []),
          { variant: 'danger', content: 'Ocorreu um erro. Por favor, tente mais tarde.' }
        ];
        return done(error, false);
      }
    }
  )
);
