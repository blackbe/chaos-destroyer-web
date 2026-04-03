# Unified Nightly Build Backlog
# Status: [ ] = pending, [x] = completed, [s] = skipped, [b] = blocked
# Single builder picks the first [ ] task (tagged [HUGBACK] or [CHAOS-DESTROYER])
#
# 🟢 UNBLOCKED (2026-03-15 01:00 AM): Node symlink issue RESOLVED
# Fix applied: /usr/local/bin/{node,npm,npx} symlinks created
# All [b] items changed back to [ ] on 2026-03-16 (resuming builds)

## 🔴 PRIORITY: INTEGRATION BUILD (Tonight 2026-03-17)
[x] 0. [HUGBACK] **INTEGRATION BUILD** — Extract all 24 completed tasks (1-24) and integrate actual production code into ~/hugback/src/ and ~/hugback/backend/. Create comprehensive README explaining what was added. Test locally. Commit. Push to main. Deploy to Vercel. This is the blocker — builds have been generating examples but never making it into the live app. **SCHEDULED FOR TONIGHT (2026-03-17 midnight build)**.

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
[x] 23. [HUGBACK] Git commit message formatter — enforces conventional commits (feat/fix/chore) for HugBack
[x] 24. [HUGBACK] Mobile responsive tester — Puppeteer script that screenshots the app at 5 breakpoints
[x] 25. [HUGBACK] User signup funnel tracker — Supabase query that shows signup starts vs completions vs active users **[RESUME FROM HERE ON 2026-03-18]**
[x] 26. [HUGBACK] Test data seeder — creates fake users, check-ins, stories, hug requests for local dev
[x] 27. [HUGBACK] Error log summarizer — parses Railway logs and groups errors by type/frequency **[FIXED 2026-03-21 20:00: Added missing CSS file, build passes]**
[x] 28. [HUGBACK] Release notes generator — reads git log since last tag and formats a changelog

## Integrated Backlog (HugBack + Chaos Destroyer Alternating)
[x] 29. [HUGBACK] Daily Supabase backup script — exports key tables to JSON files with timestamps
[x] 30. [CHAOS-DESTROYER] Budget dashboard — Real-time view of monthly spend, savings targets, warnings
[x] 31. [HUGBACK] Performance budget checker — sets thresholds for bundle size, API response time, and alerts if exceeded
[x] 32. [CHAOS-DESTROYER] Calendar intelligence — Summarize upcoming week (meetings, deadlines, free blocks)
[x] 33. [HUGBACK] Unused code finder — detects exported functions/components that are never imported anywhere
[x] 34. [CHAOS-DESTROYER] Email triage system — Auto-categorize important vs noise, flag urgent items
[x] 35. [HUGBACK] Environment variable validator — checks .env vs .env.example and flags missing/extra vars
[x] 36. [CHAOS-DESTROYER] Therapy notes organizer — Parse session notes, extract key insights, track progress
[x] 37. [HUGBACK] Inline style extractor — finds inline styles in components and suggests CSS class equivalents
[x] 38. [CHAOS-DESTROYER] Reconnection toolkit v2 — Enhanced system for contacting Delilah (tracking, templates, grounding)
[x] 39. [HUGBACK] API endpoint documentation generator — reads server.js and outputs a markdown API reference
[x] 40. [CHAOS-DESTROYER] West Coast Swing tracker — Track lesson progress, choreography notes, competition prep
[x] 41. [CHAOS-DESTROYER] Test Chaos Destroyer web UI end-to-end and document any issues
[x] 42. [HUGBACK] Lighthouse CI script — runs Lighthouse on the deployed URL and saves scores over time
[x] 43. [CHAOS-DESTROYER] Add missing features to the debt tracker
[x] 44. [HUGBACK] Matching algorithm (AI-based compatibility) — From Trello Phase 2 #53
[ ] 45. [CHAOS-DESTROYER] Fix bugs or performance issues in Chaos Destroyer web UI
[ ] 46. [HUGBACK] Support board (like Reddit) — From Trello Phase 2 #54
[ ] 47. [CHAOS-DESTROYER] Polish the UI/UX of Chaos Destroyer web UI
[ ] 48. [HUGBACK] Real-time chat system (like WhatsApp) — From Trello Phase 2 #55
[ ] 49. [CHAOS-DESTROYER] Deploy Chaos Destroyer web UI somewhere (Vercel)
[ ] 50. [HUGBACK] Meetup coordination (like Meetup.com) — From Trello Phase 2 #56
[ ] 51. [CHAOS-DESTROYER] MTG deck builder assistant — Parse card lists, suggest synergies, cost analysis
[ ] 52. [HUGBACK] AI moderation system (expensive, complex) — From Trello Phase 2 #57
[ ] 53. [CHAOS-DESTROYER] Body language mastery curriculum — Structured lesson tracker with exercises
[ ] 54. [HUGBACK] (Next HugBack item)
[ ] 55. [CHAOS-DESTROYER] Credit card paydown tracker — Visual progress on debt reduction goals
[ ] 56. [HUGBACK] (Next HugBack item)
[ ] 57. [CHAOS-DESTROYER] Dominion card game tracker — Track wins/losses, deck ideas, strategic notes from Monday games
[ ] 58. [HUGBACK] (Next HugBack item)
[ ] 59. [CHAOS-DESTROYER] ADHD & confidence journal — Daily check-in with mood, energy, wins, blockers, therapy insights
[ ] 60. [HUGBACK] (Next HugBack item)
[ ] 61. [CHAOS-DESTROYER] Personal project roadmap — Quarterly goals, milestones, progress tracking
[ ] 53. [HUGBACK] Multi-language support (translation API) — From Trello Phase 2 #58
[ ] 54. [HUGBACK] Age verification (third-party service) - 18+ only — From Trello Phase 2 #59
[ ] 55. [HUGBACK] Safety check-ins (custom system) — From Trello Phase 2 #60
[ ] 56. [HUGBACK] Location-based search (geolocation) — From Trello Phase 2 #61
[ ] 57. [HUGBACK] Interest and personality questionnaire — From Trello Phase 2 #69
[ ] 58. [HUGBACK] Basic compatibility matching (rule-based, not AI) — From Trello Phase 2 #70
[ ] 59. [HUGBACK] Filter by mood and reason for needing support — From Trello Phase 2 #71
[ ] 60. [HUGBACK] User profiles (no photos, just bio and interests) — From Trello Phase 2 #72
[ ] 61. [HUGBACK] Multiple language support via Google Translate API — From Trello Phase 2 #73
[ ] 62. [HUGBACK] ID verification via Stripe Identity ($1.50 per verification) — From Trello Phase 3 #74
[ ] 63. [HUGBACK] Lawyer-written Terms of Service and Privacy Policy — From Trello Phase 3 #75
[ ] 64. [HUGBACK] Background check integration via Checkr API ($25-50 per check) — From Trello Phase 3 #76
[ ] 65. [HUGBACK] Liability insurance policy secured — From Trello Phase 3 #77
[ ] 66. [HUGBACK] Comprehensive safety resources page — From Trello Phase 3 #78
[ ] 67. [HUGBACK] Emergency contact feature for users — From Trello Phase 3 #79
[ ] 68. [HUGBACK] Curated list of public meetup locations — From Trello Phase 3 #80
[ ] 69. [HUGBACK] Safety quiz that users must pass before first meetup — From Trello Phase 3 #81
[ ] 70. [HUGBACK] Opt-in toggle for physical meetups (default: off) — From Trello Phase 4 #82
[ ] 71. [HUGBACK] Public location coordination system — From Trello Phase 4 #83
[ ] 72. [HUGBACK] Safety check-in: 'Did you meet safely?' post-meetup — From Trello Phase 4 #84
[ ] 73. [HUGBACK] Share location with trusted friend feature — From Trello Phase 4 #85
[ ] 74. [HUGBACK] Mandatory safety quiz before first physical meetup — From Trello Phase 4 #86
[ ] 75. [HUGBACK] 24-hour cooling-off period before first meetup — From Trello Phase 4 #87
[ ] 76. [HUGBACK] Verified badge for ID-checked and background-checked users — From Trello Phase 4 #88
[ ] 77. [HUGBACK] In-app emergency contact button (calls 911) — From Trello Phase 4 #89
[ ] 78. [HUGBACK] AI-powered compatibility matching algorithm — From Trello Phase 5 #90
[ ] 79. [HUGBACK] AI content moderation (Azure Content Moderator) — From Trello Phase 5 #91
[ ] 80. [HUGBACK] Video chat capability — From Trello Phase 5 #92
[ ] 81. [HUGBACK] Advanced analytics and user insights — From Trello Phase 5 #93
[ ] 82. [HUGBACK] Community features (interest groups, local events) — From Trello Phase 5 #94
[ ] 83. [HUGBACK] Premium features (optional) — From Trello Phase 5 #95

---

## Notes
- HugBack features (1-15) are complete, waiting for integration into app
- HugBack infrastructure (16-28) completed
- **New integrated backlog (29-83):** HugBack + Chaos Destroyer alternating
  - HugBack items: Infrastructure/tooling (29-42), Phase 2-5 features from Trello (43-83)
  - Chaos Destroyer: Personal projects interspersed throughout
- Builder routes outputs to appropriate directory based on tag
- Netflix resume builder (was old #36) removed per request
- **Backlog now 83 total items:** 57 HugBack + 12 Chaos Destroyer + 14 shared
