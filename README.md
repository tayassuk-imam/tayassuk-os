# Tayassuk OS

A premium personal portfolio operating system for Tayassuk Imam, built as a responsive static web experience.

## Start locally

Use any static server from the repository root, for example:

```bash
python -m http.server 8080
```

Then open http://localhost:8080/.

## Content editing

Core owner data is centralized in `content/owner-profile.js`.
Projects are centralized in `content/projects.js`. Add a new object to the `projects` array to create a new project without changing the UI code.

Phone, GitHub, LinkedIn and other future links are intentionally empty until approved values are added.

## Assets

- `assets/cv/Tayassuk-Imam-CV.pdf` — official CV supplied for download.
- `assets/avatar/tayassuk-portrait.png` — cropped portrait from supplied CV.
- `assets/avatar/tayassuk-generated-avatar.png` — generated stylized visual created during the design pass.

## Notes

- Whiteboard content is local-only.
- No API keys are used in the frontend.
- Live project URL is included as provided by the owner.
- `sitemap.xml` contains an example domain and should be updated when the real domain is decided.
