TAYASSUK OS — FINAL COLOUR FLECKS UPDATE

Included:
- styles.css: preserves the existing layout and effects; boot-screen floating flecks now use blue, soft orange and soft red.
- birds.js: black bird silhouettes from the previous update.

Install:
1. Back up your current styles.css.
2. Replace it with this styles.css.
3. Keep birds.js in the same folder as index.html (if you are using the bird animation).
4. Ensure index.html has <script src="./birds.js" defer></script> immediately before </body> (only once).
5. Commit/push to GitHub Pages, then hard-refresh with Ctrl+Shift+R.

The flecks reuse the existing 8 particles and existing bootFloat animation. No extra JS, canvas, blur layer, or additional particle loops are added, so the change is lightweight.
