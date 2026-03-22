# LectureLink
### QR Code-Based Lecture Attendance Management System
**Group 13 — Web Programming Project — University of Makeni (UNIMAK)**

---

## Team Members

| Name | Student ID | Contribution |
|---|---|---|
| Alimamy Emmanuel Kamara | 11277 | Business Goals & Objectives |
| Emmanuel Aruna | 10027 | Recommended Solution |
| Leema Kamara | 8780 | Project Summary |
| Samuel Dumbuya | 10533 | Competitive Analysis |
| Momoh Kargbo | 10838 | Technology Stack |

---

## Project Overview

LectureLink is a mobile-first web application that replaces paper sign-in sheets for university lecture attendance. A lecturer generates a unique, time-sensitive QR code at the start of class. Students scan it to instantly log their attendance — reducing a 15-minute manual process to under 60 seconds.

This prototype is a **front-end only** implementation built with plain HTML, CSS, and JavaScript. It runs entirely in the browser with no server, no database, and no installation required.

---

## How to Run

1. Download `LectureLink_App.html`
2. Open it in any modern web browser (Chrome, Firefox, Edge, Safari)
3. That's it — no setup, no install, no internet required after the page loads

---

## Logging In

This is a prototype — **any email and password combination will work**. There is no credential validation. Simply:

1. Select your role tab — **Student**, **Lecturer**, or **Admin**
2. Type any email address (e.g. `yourname@unimak.edu.sl`)
3. Type any password (e.g. `password`)
4. Click **Sign In**

The app will create a temporary account automatically and route you to the correct portal.

### Pre-loaded Demo Accounts (optional)

If you want accounts that already have attendance history and class data pre-loaded, use any of the following:

| Role | Email | Password |
|---|---|---|
| Student | akamara@unimak.edu.sl | student123 |
| Student | earuna@unimak.edu.sl | student123 |
| Student | mkargbo@unimak.edu.sl | student123 |
| Lecturer | ikoroma@unimak.edu.sl | lecturer123 |
| Lecturer | mbangura@unimak.edu.sl | lecturer123 |
| Admin | admin@unimak.edu.sl | admin123 |

> You can also register a brand new student account using the **Register here** link on the login screen.

---

## Features

### Student Portal
- Login with any email and password — no credential validation in prototype mode
- Register a new account using the Register link on the login screen
- Permanent **Scan QR Code** button always visible at the top of the dashboard
- Live session banner appears automatically when a lecturer starts a session
- Enter the QR token from the lecturer screen to mark attendance instantly
- View personal attendance history with date and time of each entry
- See overall attendance statistics (total sessions, present count, percentage)

### Lecturer Portal
- Login with lecturer credentials
- Select a class and session duration (5, 10, or 15 minutes)
- Generate a live QR code with a countdown timer
- Watch the signed-in student count update in real time
- End a session manually at any time
- View session history with attendance rates and progress bars

### Admin Portal
- University-wide attendance statistics at a glance
- Departmental attendance breakdown with visual progress bars
- Full user table showing all registered students and lecturers
- Complete attendance report with all recorded entries
- Export the full report as a CSV file

---

## How to Test the Full Attendance Flow

1. **Open the app** in your browser
2. **Select the Lecturer tab** and sign in with any email and password
3. Select **Advanced Software Engineering** from the class dropdown
4. Click **Generate QR Code** — a live QR code and token appear on screen
5. **Copy the token** shown under the QR image (e.g. `QR-ABC123-XYZ`)
6. **Open a second browser tab** with the same HTML file
7. **Select the Student tab** and sign in with any email and password
8. Click the **Scan QR Code** button — always visible at the top of the dashboard
9. The token is pre-filled automatically; click **Mark My Attendance**
10. Switch back to the **Lecturer tab** — the signed-in counter updates live
11. **Select the Admin tab** in a new tab to see the attendance record in the full report

---

## Project Structure

Since this is a single-file front-end prototype, everything lives in one file:

```
LectureLink_App.html
├── <style>        — All CSS (variables, layout, components)
├── <body>         — Four screens (Login, Student, Lecturer, Admin)
└── <script>       — All application logic (auth, QR, attendance, export)
```

### Key Sections in the JavaScript

| Section | What it does |
|---|---|
| `DB` object | In-memory data store — users, classes, sessions, attendance records |
| `doLogin()` | Accepts any credentials — creates a temporary user if the email is new, routes to the selected role portal |
| `doRegister()` | Creates a new student account and saves it to the DB |
| `startSession()` | Generates a unique token, creates a session, starts the QR countdown |
| `endSession()` | Closes the session and refreshes both dashboards |
| `submitScan()` | Validates the token, auto-enrols the student if needed, writes an attendance record |
| `loadAdminDash()` | Calculates all statistics and renders the full report |
| `exportCSV()` | Builds a CSV string from attendance records and triggers a download |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, flexbox, grid, mobile-first) |
| Logic | Vanilla JavaScript (ES6+) |
| QR Generation | QRCode.js (loaded from CDN) |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| Data Storage | In-memory JavaScript object (no database) |

---

## Planned Full-Stack Architecture (Production)

In a real deployment, this front end would connect to:

| Layer | Technology |
|---|---|
| Front End | React.js PWA (Progressive Web App) |
| Back End | Node.js + Express (RESTful API) |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (JWT) + bcrypt |
| QR Engine | QRCode.js (server-side generation) + html5-qrcode (client scanning) |
| Security | SSL/HTTPS, nightly automated backups |
| Hosting | Low-cost VPS (e.g. Contabo) |

---

## SMART Goals (12-Month Target)

| Goal | Metric |
|---|---|
| Specific | 50% of target classes actively using the system |
| Measurable | 95% accuracy in recorded attendance |
| Achievable | Budget and skills exist within the student developer group |
| Relevant | Directly addresses time waste and attendance fraud |
| Time-bound | Deployed by end of academic year (December 2026) |

---

## Submission

- **Course:** Web Programming
- **Institution:** University of Makeni (UNIMAK)
- **Degree:** BSc Computer Science
- **Submission Email:** abkamara@unimak.edu.sl
- **GitHub:** *(link to be submitted separately as per instructions)*

---

*LectureLink — A university where attendance is frictionless, accurate, and fraud-free.*
