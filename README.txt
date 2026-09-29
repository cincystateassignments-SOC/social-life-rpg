SOCIAL LIFE v0.3 — IMPLEMENTATION GUIDE

QUICK TEST
1. Unzip the folder.
2. Open index.html in Chrome, Edge, Firefox, or Safari.
3. Use WASD/arrow keys to move and Space/Enter to interact.

GITHUB PAGES (recommended for students)
1. Create a new GitHub repository (for example: social-life-rpg).
2. Upload index.html, style.css, and game.js to the repository root.
3. In the repository, open Settings > Pages.
4. Under Build and deployment, choose Deploy from a branch.
5. Select the main branch and / (root), then Save.
6. GitHub will provide a public HTTPS address. Put that link in your LMS.

IMPORTANT
- The game is static HTML/CSS/JavaScript. No server, database, npm, or build process is required.
- Student progress is saved in that browser with localStorage. It does not currently sync across devices or report grades to an LMS.
- To publish an update, replace the three files in the repository. Existing browser saves remain unless the save-data format changes.
- For a graded version later, add an end-of-chapter completion code, downloadable completion record, or LMS/LTI integration. v0.3 is intentionally a learning-game prototype rather than a grade-reporting system.

FILES
index.html — page/UI structure
style.css — 8-bit visual presentation and responsive layout
game.js — map, movement, dialogue, quests, sociology concepts, saving
