# OpportunityTracker — demo login

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000** (you'll land on the login page).

Demo login: **coordinator@demo.edu / demo123**. On the login page, **Fill for me** types it in for you.

> VS Code Live Server (port 5500) can't run the backend. Use `npm start` and port 3000 instead.

## What's included

| File | What it does |
|---|---|
| `login.html` | Animated intro + login page (splash, particles, typewriter, demo-credentials card) |
| `server.js` | Express server: serves the site, handles login, protects the dashboard |
| `data/users.json` | Users, with bcrypt-hashed passwords (never plain text) |
| `scripts/add-user.js` | Adds or updates a login |
| `.env.example` | Settings. Copy to `.env` |

## API

| Method | Path | |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password, remember }` sets an httpOnly session cookie |
| GET | `/api/auth/me` | Current user, or 401 |
| POST | `/api/auth/logout` | Signs out |
| GET | `/logout` | Signs out and goes back to the login page |

Every `.html` page except `login.html` and `intro.html` needs a login. Without one, you're sent to `/login.html`.
After 5 wrong passwords in 15 minutes, logins from that IP are blocked for a while.

## Add another user

```bash
npm run add-user -- student@demo.edu "Priya Sharma" secret123 student
```

## Stay signed in across restarts

Copy `.env.example` to `.env` and set `JWT_SECRET` to a long random string. Without it, everyone is signed out whenever the server restarts.

## Add a sign-out link to the dashboard (optional)

```html
<a class="nav-item" href="/logout">Sign out</a>
```

## Put it online (Render, free)

1. **Upload to GitHub.** Create a new repository named `opportunity-tracker` on github.com. Then, in this folder:
   ```bash
   git init
   git add .
   git commit -m "OpportunityTracker"
   git branch -M main
   git remote add origin https://github.com/sristii22/opportunity-tracker.git
   git push -u origin main
   ```
2. **Deploy on Render.** On render.com, click **New + → Blueprint**, pick the `opportunity-tracker` repository, then **Apply**. `render.yaml` sets everything up, including a secret key.
3. After a few minutes your site is live at **https://opportunitytracker-sristi.onrender.com**. Open it and sign in with the demo login.

On Render's free plan the site sleeps after 15 minutes without visitors. The first visit after that can take up to a minute to load.
