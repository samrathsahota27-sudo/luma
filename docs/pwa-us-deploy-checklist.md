# PWA + Us Deploy Checklist

## 1) Pre-deploy gates

- Run typecheck:
  - `npx tsc --noEmit`
- Run production build:
  - `npm run build`
- Confirm `proxy.ts` exists and `middleware.ts` is removed.
- Confirm PWA assets exist:
  - `public/manifest.json`
  - `public/icon-192.png`
  - `public/icon-512.png`

## 2) Supabase migrations (apply in order)

1. `20260427031000_user_profiles_us_tab_fields.sql`
2. `20260427033000_user_profiles_completion_tracking.sql`
3. `20260427034500_user_profiles_streak_tracking.sql`

Apply via Supabase SQL editor or migration workflow before promoting to production.

## 3) Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (used for AI-generated overlap insight):

- `OPENAI_API_KEY`

## 4) Supabase runtime settings

- Enable Realtime on `public.couple_sessions` (for partner join live updates in `Us`).
- Ensure service-role key in Vercel belongs to the same Supabase project as public keys.
- Storage bucket `profile-photos` is auto-created by API on first upload; no manual step required.

## 5) Vercel deploy

- Deploy the branch.
- Verify build logs have no middleware deprecation warning.
- Verify no workspace-root warning (fixed by `turbopack.root` in `next.config.mjs`).

## 6) Post-deploy smoke tests (mobile + PWA)

1. **PWA shell**
   - Open app on mobile browser.
   - Confirm install prompt appears when appropriate.
   - Install app and relaunch from home screen.
   - Confirm PWA bottom nav shows: `Home / Explore / Chat / Answers / Us`.

2. **Us page basics**
   - Open `/us`.
   - Confirm profile completion ring + checklist render.
   - Confirm activity card shows dual bars + streak + share button.

3. **Profile photo upload**
   - Tap `Add` on Profile Photo.
   - Upload image.
   - Confirm avatar updates and persists after refresh.

4. **Date fields**
   - Add anniversary and birthday.
   - Refresh.
   - Confirm saved values remain.

5. **Partner connection realtime**
   - Account A opens `/us` and creates/opens invite.
   - Account B joins mirror code.
   - Confirm Account A updates without manual refresh to connected state and overlap insight.

6. **Streak + activity**
   - Complete at least one reflection or Tonight Question.
   - Confirm streak updates and `last_activity_date/current_streak` persist.
   - Confirm encouraging message appears if streak is broken.

7. **Share stats**
   - Tap `Share your stats`.
   - On devices with native share + file support, verify image share card attachment.
   - Otherwise verify text share/clipboard fallback.

## 7) Rollback strategy

- If `/us` errors after deploy:
  - Verify migrations in step 2 are applied.
  - Verify env vars in step 3.
  - Check Vercel function logs for `/api/us/activity` and `/api/us/photo`.
