# Evidence Quest: ISO 27001 Audit Challenge

A web-based interactive training game for cybersecurity consultants to practice requesting, assessing, and challenging audit evidence during ISO/IEC 27001:2022 audits.

## Tech Stack
- React
- Vite

## Run the project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview production build:
   ```bash
   npm run preview
   ```

## Deploy to GitHub Pages
1. Push this repository to GitHub and ensure your default branch is named `main`.
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push a commit to `main` (or run the workflow manually from **Actions → Deploy to GitHub Pages**).
5. Wait for the workflow to finish. It will publish the game and show a deployment URL.
6. Your live game URL will be:
   - `https://<your-github-username>.github.io/evidence-request/`

## Gameplay overview
- You act as an auditor reviewing fictional client scenarios.
- In each question, select the strongest evidence options.
- Correct selections earn points.
- You progress through 5 levels:
  - Access Control
  - Risk Management
  - Incident Management
  - Logging & Monitoring
  - Cloud Security
- At the end, your score maps to a rank:
  - Evidence Rookie
  - Audit Analyst
  - Senior Consultant
  - Lead Auditor

## Add or edit questions
All questions are stored in:
- `src/data/questions.json`

Each level has a `questions` array. Each question follows this structure:

```json
{
  "id": "unique-id",
  "isoReference": "ISO/IEC 27001:2022 Clause or Annex A reference",
  "scenario": "Fictional client scenario only",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswers": [0, 2],
  "feedback": {
    "0": "Why option A is right/wrong",
    "1": "Why option B is right/wrong",
    "2": "Why option C is right/wrong",
    "3": "Why option D is right/wrong"
  },
  "points": 10
}
```

### Notes for expansion
- Add 50+ questions per level by appending to each `questions` array.
- Keep `id` values unique.
- `correctAnswers` uses option indexes (0-based).
- Keep scenarios fictional and free of confidential or real client information.
