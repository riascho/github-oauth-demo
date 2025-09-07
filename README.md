# GitHub OAuth Express Application

## Project Overview

This project was built as a demonstration of OAuth 2.0 authentication using GitHub as the provider. The application was implemented using Express.js with session management and route protection middleware.

This project was part of the Codecademy course module `"User Authentication and Authorization"` in the `"Back-End Engineer"` Career Path.

## Purpose

This application was developed to demonstrate secure user authentication and authorization patterns in web applications. Authentication and authorization represent critical security components, as evidenced by their inclusion in the OWASP Top Ten security risks.

**Key Features Implemented:**

- OAuth 2.0 authentication with GitHub
- Server-side session management using express-session
- Route protection middleware for authenticated users
- User profile display and logout functionality

## How to Use

0. **Preparation**: Clone this repository and install dependencies via `npm install`
1. **Setup**: Configure GitHub OAuth app credentials in your environment
2. **Start**: Run the application with `npm start` and follow the server address in the CLI
3. **Login**: Click "Login with GitHub" to authenticate via OAuth
4. **Access**: View your GitHub profile information on the account page
5. **Logout**: Use the logout link to end your session

## Core Components

1. **`express-session`**

   - Creates and manages user sessions on server-side
   - Generates session ID and stores it in a cookie on user's browser
   - Session secret signs the cookie to prevent tampering
   - Sessions stored in memory (default MemoryStore) - not suitable for production
   - Required for Passport authentication to work

2. **`express-partials`**

   - Enables EJS templates to use partials for layout inheritance
   - Allows HTML template injection using a wrapper layout
   - Works with Express's default `/views` directory structure
   - See more details [here](#quick-note-on-embedded-javascript-ejs-and-express--express-partials)

3. **`passport`**

   - Authentication middleware that abstracts OAuth complexity
   - **serializeUser()**: Determines what user data gets stored in session (stores entire user profile in demo)
   - **deserializeUser()**: Retrieves user data from session on each request
   - Provides `req.isAuthenticated()` and `req.user` for easy access
   - Requires initialization and session connection

4. **`passport-github2`**
   - Passport middleware automatically manages OAuth flow via GitHub OAuth 2.0 strategy for Passport
   - `/auth/github` initiates OAuth, `/auth/github/callback` handles return
   - `passport.authenticate("github")` handles all HTTP requests to GitHub's OAuth endpoints
   - Passport internally exchanges auth code for access token (Server-to-Server-Communication)
   - Token passed to `verifyCallback` but not persisted in this demo
   - Only user profile data stored in session, not the access token
   - Requires `clientID`, `clientSecret`, and `callbackURL` from GitHub app registration
   - Executes `verifyCallback` function after successful authentication

## OAuth Flow:

1. **Initiation**: User visits `/auth/github` → redirected to GitHub
2. **Authorization**: User grants permission on GitHub (pop-up window)
3. **Callback**: GitHub redirects to `/auth/github/callback` with auth code
4. **Token Exchange**: `Passport` exchanges code for access token (automatic)
5. **Profile Retrieval**: App fetches user profile using access token
6. **Session Storage**: User profile stored in session via `serializeUser()`

## Quick Note on Embedded Javascript (EJS) and express + express-partials

**Template System Overview:**

- **Express**: Web framework that handles routing and HTTP requests (similar to Flask)
- **EJS**: Server-side template engine that processes templates before sending HTML (similar to Jinja2)
- **express-partials**: Middleware that provides layout functionality for template inheritance

**How EJS Works:**

- Server-side rendering - templates processed on server, not in browser
- Dynamic content injection using `<% %>` for logic and `<%= %>` for output
- Different from client-side frameworks (React/Vue) - no components or reactivity
- More like traditional templating (PHP/ASP) for generating HTML with dynamic data

**Template Structure:**

- `views/` folder: Default directory for templates (like Flask's `templates/` folder)
- `layout.ejs`: Default wrapper template (convention from express-partials)
- Individual pages: `index.ejs`, `account.ejs`, `login.ejs` contain page-specific content
- `<%- body %>` placeholder in layout where page content gets injected

**Flow:**

1. Route handler calls `res.render('pagename', data)`
2. express-partials intercepts and renders the specific page
3. Page content gets injected into `layout.ejs` at `<%- body %>`
4. Complete HTML sent to browser with layout + page content

This provides template inheritance similar to Flask's Jinja2 system, allowing shared layouts across all pages while keeping content separation clean.
