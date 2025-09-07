/*
 * GitHub OAuth Application with Express and Passport
 *
 * OAUTH FLOW OVERVIEW:
 * 1. User clicks "Login with GitHub" → GET /auth/github
 * 2. App redirects user to GitHub's authorization server
 * 3. User grants/denies permission on GitHub
 * 4. GitHub redirects back to app with authorization code → GET /auth/github/callback
 * 5. App exchanges authorization code for access token (handled by Passport)
 * 6. App uses access token to get user profile from GitHub API
 * 7. User profile is stored in session via serialize/deserialize functions
 * 8. User is now authenticated and can access protected routes
 *
 * KEY COMPONENTS:
 * - express-session: Creates and manages user sessions on server
 * - passport: Handles authentication strategies and user serialization
 * - passport-github2: Implements GitHub OAuth 2.0 strategy
 * - Session cookies: Store session ID in user's browser
 * - ensureAuthenticated: Middleware to protect routes requiring login
 */
/*
 * Package Imports
 */
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv"; // Load environment variables from .env file
import express from "express"; // uses '/views' as default to look for HTML templates
import partials from "express-partials"; // Allows EJS templates to use partials
import session from "express-session"; // Enables server-side session storage
import passport from "passport"; // Authentication middleware for Node.js
import { Strategy as GithubStrategy } from "passport-github2"; // GitHub OAuth 2.0 strategy for Passport
const app = express();
const __filename = fileURLToPath(import.meta.url); // gives the full path to the current FILE "/Users/maria/projects/github-oauth-app/app.ts"
const __dirname = dirname(__filename); // gives the directory containing the file "/Users/maria/projects/github-oauth-app"
/*
 * Variable Declarations
 */
config(); // Loads environment variables from .env file into process.env
const PORT = 3000;
// OAuth credentials from GitHub app registration - stored in .env file for security
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error("Missing GitHub OAuth credentials");
    process.exit(1); // Stop the app if credentials are missing
}
/*
 * Passport Configurations
 */
// Configure GitHub OAuth strategy
passport.use(new GithubStrategy({
    clientID: GITHUB_CLIENT_ID, // Public identifier for your GitHub OAuth app
    clientSecret: GITHUB_CLIENT_SECRET, // Secret key for your GitHub OAuth app
    callbackURL: "http://localhost:3000/auth/github/callback", // Where GitHub redirects after auth
}, verifyCallback // Function called after successful GitHub authentication
));
// Serialize user data into session - determines what data is stored in session
passport.serializeUser((user, done) => {
    done(null, user); // Store entire user profile in session (in production, store just user ID)
});
// Deserialize user data from session - retrieves user data from session
passport.deserializeUser((user, done) => {
    done(null, user); // Return the user object (in production, fetch full user data from database)
});
// Callback function executed after GitHub returns user data
// accessToken: Token to make API calls to GitHub on user's behalf
// refreshToken: Token to refresh the access token when it expires
// profile: User's GitHub profile information
// done: Callback to continue the authentication process
function verifyCallback(accessToken, refreshToken, profile, done) {
    // In production, you would save user to database and return user ID
    // For this demo, we just pass the profile directly
    return done(null, profile);
}
/*
 *  Express Project Setup
 */
app.set("view engine", "ejs"); // Use EJS template engine
app.set("views", __dirname + "/views"); // Set views directory
app.use(express.static(__dirname + "/public")); // Serve static files from public directory
app.use(partials()); // Enable EJS partials
app.use(express.json()); // Parse JSON request bodies
// Session configuration - required for Passport to work
app.use(session({
    secret: "codecademy", // Secret key to sign session ID cookie (use strong secret in production)
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    // no store option specified, express-session uses the default node.js
}));
// Initialize Passport and connect it to Express session
app.use(passport.initialize()); // Initialize Passport middleware
app.use(passport.session()); // Enable persistent login sessions
/*
 * Routes
 */
// For anonymous functions in Express routes:
//   - TypeScript can infer the parameter types from context
//   - It knows app.get() expects a callback with Express Request, Response parameters
//   - The types are automatically provided by the Express method signature
// Home page - accessible to all users (shows different content if logged in)
app.get("/", (req, res) => {
    // Log user data on each home page visit (if authenticated)
    res.render("index", { user: req.user }); // req.user contains user data if authenticated
});
// Protected account page - only accessible to authenticated users
app.get("/account", ensureAuthenticated, (req, res) => {
    res.render("account", { user: req.user }); // Display user profile information
});
// Login page - shows login options
app.get("/login", (req, res) => {
    res.render("login", { user: req.user });
});
// Logout route - terminates user session
app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
    });
    res.redirect("/"); // Redirect to home page
}); // Passport method to clear user from session
// OAuth initiation route - redirects user to GitHub for authentication (href button in login.ejs)
// This is where the OAuth flow begins
app.get("/auth/github", passport.authenticate("github", { scope: ["user"] }));
// OAuth callback route - GitHub redirects here after user authorizes/denies
// This is step 2 of the OAuth flow where GitHub sends back the authorization code
app.get("/auth/github/callback", passport.authenticate("github", {
    failureRedirect: "/login", // Redirect here if authentication fails
    failureMessage: true, // Store failure message in session
    successRedirect: "/", // Redirect here if authentication succeeds
}));
/*
 * Listener
 */
app.listen(PORT, () => console.log(`Listening on 'http://localhost:${PORT}'`));
/*
 * ensureAuthenticated Callback Function
 * Middleware to protect routes - ensures user is logged in before accessing protected pages
 */
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        // Passport method to check if user is authenticated
        return next(); // User is authenticated, continue to next middleware/route handler
    }
    res.redirect("/login"); // User not authenticated, redirect to login page
}
//  For standalone named functions:
//   - TypeScript has no context to infer parameter types
//   - It doesn't know this function will be used as Express middleware
//   - You must explicitly annotate the types
