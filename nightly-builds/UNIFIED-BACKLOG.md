# Unified Nightly Build Backlog
# Status: [ ] = pending, [x] = completed, [s] = skipped, [b] = blocked
# Single builder picks the first [ ] task (tagged [HUGBACK] or [CHAOS-DESTROYER])
#
# 🔴 BLOCKED (2026-03-14): All backlog tasks paused until Node symlink issue is fixed
# Issue: npm scripts fail in launchd (#!/usr/bin/env node shebang can't find node)
# Fix: Tonight's build will run fix-node-symlinks.sh
# Resume: All [b] items will be changed back to [ ] after fix verified

## 🔴 PRIORITY: INTEGRATION BUILD (Tonight 2026-03-12)
[x] 0. [HUGBACK] **INTEGRATION BUILD** — Extract all 19 completed tasks (1-21) and integrate actual production code into ~/hugback/src/ and ~/hugback/backend/. Create comprehensive README explaining what was added. Test locally. Commit. Push to main. Deploy to Vercel. This is the blocker — builds have been generating examples but never making it into the live app.

## HugBack Features
[x] 1. [HUGBACK] Hamburger menu pulse animation — Make the hamburger menu slowly flash to draw attention to navigation
[x] 2. [HUGBACK] Interest & personality questionnaire component — React component with ~15 questions, results stored in Supabase
[x] 3. [HUGBACK] Language toggle UI — Add language selector dropdown (Google Translate API integration ready)
[x] 4. [HUGBACK] Mood filter component — Add filter to show matches by mood (happy, calm, anxious, sad)
[x] 5. [HUGBACK] Basic rule-based matcher — Algorithm that matches users by distance, age range, mood, and interests
[x] 6. [HUGBACK] User profile builder — Form to edit interests, bio, age range, location (no photos, privacy-first)
[x] 7. [HUGBACK] Report & block functionality — Modal and DB logic for users to report or block unsafe profiles
[x] 8. [HUGBACK] Terms of Service page — Lawyer-written ToS template (Ben to customize)
[x] 9. [HUGBACK] Privacy Policy page — Lawyer-written Privacy Policy template (Ben to customize)
[x] 10. [HUGBACK] Admin dashboard skeleton — Page to view user count, report counts, system health
[x] 11. [HUGBACK] Mobile-responsive hamburger menu — Fix mobile layout, ensure all nav items accessible on small screens
[x] 12. [HUGBACK] Affirmation notification banner — Daily rotating affirmations displayed when user logs in
[x] 13. [HUGBACK] Onboarding flow — Guided steps for new users (sign up → questionnaire → profile → first match)
[x] 14. [HUGBACK] Safety tips component — Prompts and tips shown throughout the app
[x] 15. [HUGBACK] Data export feature — Allow users to download their data (GDPR/CCPA compliance)

## HugBack Infrastructure & Polish
[x] 16. [HUGBACK] CSS variable extractor — scan all .js and .css files, find hardcoded colors/fonts, output a report of what should be design tokens
[x] 17. [HUGBACK] Component dependency map — generate a visual map (Mermaid diagram) showing which files import which
[x] 18. [HUGBACK] Deploy checklist script — pre-push validator that checks for console.logs, hardcoded URLs, missing env vars, and lint errors
[x] 19. [HUGBACK] Kindness message bulk uploader — CLI tool to upload CSV of messages to Supabase kindness_messages table
[x] 20. [HUGBACK] Supabase health check — script that checks DB connectivity, row counts per table, and last activity timestamp
[x] 21. [HUGBACK] Accessibility audit — scan components for missing aria-labels, alt text, color contrast issues
[x] 22. [HUGBACK] Bundle size reporter — analyze the build output and flag large dependencies
[b] 23. [HUGBACK] Git commit message formatter — enforces conventional commits (feat/fix/chore) for HugBack
[b] 24. [HUGBACK] Mobile responsive tester — Puppeteer script that screenshots the app at 5 breakpoints
[b] 25. [HUGBACK] User signup funnel tracker — Supabase query that shows signup starts vs completions vs active users
[b] 26. [HUGBACK] Test data seeder — creates fake users, check-ins, stories, hug requests for local dev
[b] 27. [HUGBACK] Error log summarizer — parses Railway logs and groups errors by type/frequency
[b] 28. [HUGBACK] Release notes generator — reads git log since last tag and formats a changelog
[b] 29. [HUGBACK] Daily Supabase backup script — exports key tables to JSON files with timestamps
[b] 30. [HUGBACK] Performance budget checker — sets thresholds for bundle size, API response time, and alerts if exceeded
[b] 31. [HUGBACK] Unused code finder — detects exported functions/components that are never imported anywhere
[b] 32. [HUGBACK] Environment variable validator — checks .env vs .env.example and flags missing/extra vars
[b] 33. [HUGBACK] Inline style extractor — finds inline styles in components and suggests CSS class equivalents
[b] 34. [HUGBACK] API endpoint documentation generator — reads server.js and outputs a markdown API reference
[b] 35. [HUGBACK] Lighthouse CI script — runs Lighthouse on the deployed URL and saves scores over time

## Chaos Destroyer / Minimi Projects
[b] 36. [CHAOS-DESTROYER] Netflix resume builder — Extract credentials, compile achievements, create polished resume doc
[b] 37. [CHAOS-DESTROYER] Budget dashboard — Real-time view of monthly spend, savings targets, warnings
[b] 38. [CHAOS-DESTROYER] Calendar intelligence — Summarize upcoming week (meetings, deadlines, free blocks)
[b] 39. [CHAOS-DESTROYER] Email triage system — Auto-categorize important vs noise, flag urgent items
[b] 40. [CHAOS-DESTROYER] Therapy notes organizer — Parse session notes, extract key insights, track progress
[b] 41. [CHAOS-DESTROYER] Reconnection toolkit v2 — Enhanced system for contacting Delilah (tracking, templates, grounding)
[b] 42. [CHAOS-DESTROYER] West Coast Swing tracker — Track lesson progress, choreography notes, competition prep
[b] 43. [CHAOS-DESTROYER] MTG deck builder assistant — Parse card lists, suggest synergies, cost analysis
[b] 44. [CHAOS-DESTROYER] Body language mastery curriculum — Structured lesson tracker with exercises
[b] 45. [CHAOS-DESTROYER] Credit card paydown tracker — Visual progress on debt reduction goals
[b] 46. [CHAOS-DESTROYER] Job search dashboard — Track Netflix applications, interview pipeline, offer tracking
[b] 47. [CHAOS-DESTROYER] Resume polish (Netflix SDET role) — Tailor resume to Account & Security Experiences job
[b] 48. [CHAOS-DESTROYER] Personal project roadmap — Quarterly goals, milestones, progress tracking

---

## Notes
- HugBack features (1-15) are complete, waiting for integration into app
- HugBack infrastructure (16-35) are tooling/polish tasks
- Chaos Destroyer (36-48) are personal projects/life organization
- Builder routes outputs to appropriate directory based on tag
