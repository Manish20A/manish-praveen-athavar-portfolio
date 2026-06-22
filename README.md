# Manish Praveen Athavar — Professional Portfolio Website

A highly responsive, glassmorphic personal portfolio website designed for **Manish Praveen Athavar** (Computer Science & Engineering Student at Srinivas Institute of Technology) to showcase technical systems, automation workflows, and active projects.

Designed to be immediately deployable on **Vercel** with zero build configuration (pure static HTML/CSS/JS architecture).

---

## 🚀 Key Features

1. **Vibrant Glassmorphic Aesthetics**: Built using vanilla CSS HSL colors, backdrop filters, custom card components, and gradients. Optimized for both dark and light modes.
2. **Interactive Developer Terminal (Console CLI)**: An embedded retro-modern terminal allowing visitors (and recruiters) to interactively query profile sections. Try running `help`, `about`, `skills`, `projects`, or `contact`.
3. **OptiShrink Pro Live Integration**: Your fully-functional client-side image optimizer tool is preserved and integrated directly in a subdirectory. Visitors can click the project card to run a live demo hosted on your domain.
4. **Structured Biography & Projects**: Displays your key projects (LiveScoreX, CodeMotion, VidGen-AI, Savayava NGO, and OptiShrink Pro), core values, and communication strengths.
5. **Interactive Forms & Tooling**: Beautiful floating-label contact form with visual states, submission validation, and mock API latency triggers.

---

## 📂 Project Structure

```
├── index.html                  # Root portfolio page
├── styles.css                  # Custom styling (HSL variable theme engine)
├── app.js                      # Custom scripts (typewriter, terminal shell, navigation)
├── package.json                # Project configuration (start script)
├── assets/
│   └── images/
│       └── portrait.png        # Arms-crossed professional profile portrait
└── projects/
    └── optishrink/
        ├── index.html          # OptiShrink Pro HTML layout
        ├── styles.css          # OptiShrink Pro layout style
        └── app.js              # OptiShrink Pro compression engine
```

---

## 💻 Running Locally

You can serve this folder locally using the pre-configured `http-server` script:

1. Install dependencies (runs a lightweight static server):
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm run start
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Deployment on Vercel

Since this is a static project, you can deploy it to Vercel in just a few seconds:

### Method 1: Vercel CLI (Fastest)
1. Install Vercel globally: `npm install -g vercel`
2. Run `vercel` in the project root:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to deploy.

### Method 2: Git Push Integration (Recommended)
1. Create a new GitHub repository (e.g., `manish-athavar-portfolio`).
2. Initialize Git, commit the files, and push them to your repository:
   ```bash
   git init
   -b main
   git add .
   git commit -m "feat: complete interactive portfolio website"
   git remote add origin https://github.com/Manish20A/manish-athavar-portfolio.git
   git push -u origin main
   ```
3. Import this repository in your [Vercel Dashboard](https://vercel.com/new).
4. Vercel will automatically detect the static project—click **Deploy**. Every git push will trigger an automated deploy!
