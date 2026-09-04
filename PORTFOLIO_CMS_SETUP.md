# Tayassuk OS — Portfolio Control Center

The public portfolio is static, but the **Control Center** is backed by Supabase so you can log in from the portfolio and publish updates without editing code.

## One-time setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase-schema.sql` from this repository.
3. In Supabase Authentication, create your admin user with an email/password.
4. Copy the Supabase **Project URL** and **anon/public key** into `content/supabase-config.js`:

```js
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
```

Never put a service-role key in the frontend.

## Using the CMS

Open the live portfolio and click the small **Available** control in the top bar to open **Control Center**.

After signing in, you can update:

- Profile and contact details
- Learning progress and focus
- Skill groups
- Education
- Achievements
- Journey
- Projects (add/edit/delete, feature/unfeature, live links, GitHub links, images)

Click **Save & Publish**. The changes are stored in Supabase and become the public portfolio's data source. Visitors see the new data on their next page load/refresh.

## Project workflow

To add a project later, use:

`Control Center → Projects → + Add Project`

No HTML/CSS editing is required.
