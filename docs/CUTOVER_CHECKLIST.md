# Cutover Checklist — Stracker (PHP → Next.js)

Complete these steps in order on cutover day.

---

## Pre-cutover (the day before)

- [ ] Verify Vercel deployment is live at preview URL and working
- [ ] Verify Neon DB has been migrated (`pnpm db:push` on production Neon)
- [ ] Verify seed completed successfully (`pnpm seed`)
- [ ] Verify both cron routes respond to manual trigger
- [ ] Verify alert emails send correctly via Resend
- [ ] Verify Google OAuth login works on preview URL
- [ ] Check Resend domain verification (DKIM/SPF)
- [ ] Test all pages: Home, Symbol, Alerts, MACD

---

## Cutover day

1. **Set production domain**
   - Vercel dashboard → Domains → Add `stracker.visegripped.com`
   - Update DNS: CNAME `stracker` → `cname.vercel-dns.com`

2. **Add OAuth origin**
   - Google Console → OAuth Client → add `https://stracker.visegripped.com` to Authorized JavaScript origins

3. **Verify DNS propagation**
   ```bash
   dig stracker.visegripped.com CNAME
   ```

4. **Smoke-test production**
   - [ ] Login with Google
   - [ ] Symbol page loads with chart data
   - [ ] Alerts page loads grid
   - [ ] Trigger `/api/cron/backfill` — verify it returns success or "no new symbols"
   - [ ] Trigger `/api/cron/daily` — verify it returns processed symbols

5. **Disable SiteGround cron**
   - Log in to SiteGround → Cron Jobs
   - Remove `daily.php` and `daily-alerts.php` entries

---

## Post-cutover

- [ ] Monitor Resend for failed email deliveries
- [ ] Check `application_reports` table for any errors
- [ ] Keep SiteGround running for 1 week (read-only safety net)
- [ ] After 1 week: evaluate decommissioning PHP backend entirely

---

## Rollback

If anything goes wrong:
1. Repoint DNS back to SiteGround
2. Re-enable SiteGround cron jobs
3. No data loss risk — Neon and SiteGround are independent

---

## Notes

- **Do NOT commit** `.env.local`, database dumps, or any file with credentials
- `lib/secretSauce.ts` is gitignored. On Vercel, set `SECRET_SAUCE_MODULE_B64`
  (generate with `pnpm encode-secret-sauce`). The `prebuild` script writes the
  file before `next build`.
