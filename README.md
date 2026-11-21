# OpportunityTracker

**Most resumes get rejected by software before a human ever reads them. OpportunityTracker shows you why, and what to fix.**

Drop in your resume and watch a magnifying glass sweep across it while the app pulls out your skills, scores it the way an ATS would, and ranks every internship by how well you fit. On the other side, university coordinators get one dashboard for every opening, every application and every placement.

## What it does

- **Reads your resume like a recruiter's software.** Upload a PDF, DOCX or TXT file. PDF.js extracts the text right in your browser, then the app gives you an ATS score out of 100 with specific tips to raise it.
- **Shows exactly where you fall short.** Pick any role to see the skills you already have in green and the gaps in red, plus advice on what to learn first to close them.
- **Finds the roles worth your time.** Search by company, role or skill. Sort by salary, duration or newest. Open any listing for the full breakdown of responsibilities and requirements.
- **Keeps your shortlist in one place.** Bookmark roles, filter them by category, and see your average salary and top category at a glance.
- **Turns placements into a story.** A coordinator dashboard with live metrics, a four-year placement trend, branch-wise results and top recruiters.
- **Locks the door properly.** A real Express backend with bcrypt-hashed passwords, JWT sessions in httpOnly cookies, protected pages, and rate limiting that shuts out an IP after 5 wrong passwords in 15 minutes.
- **Feels alive.** A splash intro, typewriter headlines, a particle network that drifts away from your cursor, counters that tick up, and cards that spring into place.

## Built with

JavaScript · HTML · CSS · Node.js · Express · PDF.js · bcryptjs · jsonwebtoken · cookie-parser · Lucide icons

## Try it locally

```bash
npm install
npm start
```

Open **http://localhost:3000**, then sign in with `coordinator@demo.edu` / `demo123`, or click **Fill for me** and watch the login type itself in.

## Add another user

```bash
npm run add-user -- student@demo.edu "Priya Sharma" secret123 student
```

## Stay signed in across restarts

Copy `.env.example` to `.env` and set `JWT_SECRET` to a long random string. Without it, everyone is signed out whenever the server restarts.

> Job listings and placement figures are sample data, built to show what the platform can do.
