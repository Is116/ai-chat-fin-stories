const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../literary-chat.db');

/**
 * Configure Passport.js with social login strategies
 */
function configurePassport() {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser((id, done) => {
    const db = new Database(dbPath);
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    } finally {
      db.close();
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      const db = new Database(dbPath);
      try {
        // Check if user exists with this Google ID
        let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);

        if (!user) {
          // Check if user exists with this email
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (email) {
            user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
            if (user) {
              // Link Google account to existing user
              db.prepare('UPDATE users SET google_id = ?, profile_photo = ?, provider = ? WHERE id = ?')
                .run(profile.id, profile.photos?.[0]?.value, 'google', user.id);
              user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
            }
          }

          // Create new user if doesn't exist
          if (!user) {
            const username = profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || `google_${profile.id}`;
            const insertResult = db.prepare(`
              INSERT INTO users (username, email, google_id, provider, profile_photo, role)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              username,
              email,
              profile.id,
              'google',
              profile.photos?.[0]?.value,
              'user'
            );
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(insertResult.lastInsertRowid);
          }
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      } finally {
        db.close();
      }
    }));
  }

  return passport;
}

module.exports = { configurePassport };
