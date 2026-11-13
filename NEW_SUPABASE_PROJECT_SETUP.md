# Tayassuk OS — New Supabase Project Setup

This package is prepared for a clean Supabase project. The existing `content/supabase-config.js` is intentionally left unchanged until the new project is created and tested.

1. In Supabase, create a **new project** named `Tayassuk OS CMS Fresh` (or another name you prefer).
2. In Authentication settings, disable public sign-ups.
3. In Authentication → Users, create the owner account `tayassuk101@gmail.com` and confirm the email.
4. In SQL Editor, run the complete `supabase-schema.sql` from this package.
5. In Project Settings → API, copy the Project URL and the **publishable key** (or legacy anon key). Never use the service-role/secret key in browser code.
6. Replace only the two values in `content/supabase-config.js`:
   - `SUPABASE_URL` = the new Project URL
   - `SUPABASE_ANON_KEY` = the new publishable/anon key
7. Commit and push that one config-file change to GitHub.
8. Test public portfolio loading, owner login, save/update, and certificate upload against the new project.
9. **Only after all tests pass and you have confirmed you no longer need the old project**, delete the old Supabase project from its Project Settings. Project deletion is permanent and removes its database, Auth users, Storage files, and backups.

The new database starts empty by design. The website continues to use the portfolio fallback data bundled in the repository until you save content from the Control Center.
