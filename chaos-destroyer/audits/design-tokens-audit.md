# 🎨 HugBack Color & Design Token Audit

**Generated:** February 4, 2026
**Backlog Task:** #1 — CSS Variable Extractor

---

## The Problem

Your app has **63 unique color values** hardcoded across **17 files**. This means:
- Changing your brand amber color requires editing 33+ places
- Inconsistent grays (you use `#666`, `#999`, `#333`, `#6b7280`, `#ccc`, `#ddd` — 6 different grays!)
- Easy to introduce visual inconsistencies when adding new features

---

## Color Inventory

### 🟡 Brand Colors (used 33+ times)
| Current Value | Used | Suggested Token | Purpose |
|---|---|---|---|
| `#f59e0b` | 33x | `--hb-amber` | Primary brand / buttons / accents |
| `#fff3e6` | 13x | `--hb-cream` | Background |
| `#fef3c7` | 5x | `--hb-amber-light` | Highlight cards |
| `#92400e` | 5x | `--hb-amber-dark` | Dark amber text |
| `#78350f` | 6x | `--hb-amber-darker` | Heading text on amber cards |

### ⬛ Text Colors (used 100+ times total)
| Current Value | Used | Suggested Token | Purpose |
|---|---|---|---|
| `#333` | 26x | `--hb-text` | Primary text |
| `#666` | 51x | `--hb-text-light` | Secondary text |
| `#999` | 13x | `--hb-text-muted` | Muted/placeholder text |
| `#6b7280` | 13x | `--hb-text-gray` | ⚠️ DUPLICATE of #666 range |

### 🔵 UI Colors
| Current Value | Used | Suggested Token | Purpose |
|---|---|---|---|
| `#3b82f6` | 19x | `--hb-blue` | Compassionate AI / secondary actions |
| `#10b981` | 23x | `--hb-green` | Success states / checkmarks |
| `#ef4444` | 21x | `--hb-red` | Error states / warnings |
| `#dc2626` | 8x | `--hb-red-dark` | ⚠️ DUPLICATE of #ef4444 range |
| `#e5e7eb` | 40x | `--hb-border` | Input borders |
| `#d1d5db` | 5x | `--hb-border-dark` | Disabled state borders |

### ⬜ Surface Colors
| Current Value | Used | Suggested Token | Purpose |
|---|---|---|---|
| `#fff` / `#ffffff` | 19x | `--hb-white` | Cards / inputs |
| `#f9fafb` | 11x | `--hb-gray-50` | Requirement box backgrounds |
| `#f3f4f6` | 4x | `--hb-gray-100` | Subtle backgrounds |

### 🚨 Alert/Feedback Colors
| Current Value | Used | Suggested Token | Purpose |
|---|---|---|---|
| `#fee2e2` | 4x | `--hb-red-bg` | Error message backgrounds |
| `#d1fae5` | 5x | `--hb-green-bg` | Success message backgrounds |
| `#991b1b` | 3x | `--hb-red-text` | Error message text |
| `#065f46` | 5x | `--hb-green-text` | Success message text |
| `#856404` | 5x | `--hb-warning-text` | Warning text |

### 🪸 Coral (Hamburger Menu brand accent)
| Current Value | Used | Suggested Token | Purpose |
|---|---|---|---|
| `rgba(232,139,106,*)` | 8x | `--hb-coral` / `--hb-coral-glow` | Menu glow animation |

---

## Files by Severity (most hardcoded colors)

| File | Hardcoded Colors | Priority |
|---|---|---|
| AdminDashboard.js | 80 | 🔴 Critical |
| Login.js | 45 | 🔴 Critical |
| HugCoach.js | 26 | 🟡 High |
| CompassionateAI.js | 24 | 🟡 High |
| Matches.js | 23 | 🟡 High |
| HugBoard.js | 23 | 🟡 High |
| StoryWall.js | 20 | 🟡 High |
| CheckIn.js | 18 | 🟠 Medium |
| Chat.js | 18 | 🟠 Medium |
| SupportBubble.js | 17 | 🟠 Medium |
| Profile.js | 14 | 🟠 Medium |
| App.js | 9 | 🟢 Low |
| Home.js | 7 | 🟢 Low |

---

## Duplicate / Redundant Colors

These colors serve the same purpose but use different values:

1. **Gray text:** `#666` (51x) vs `#6b7280` (13x) — pick one
2. **Red errors:** `#ef4444` (21x) vs `#dc2626` (8x) — pick one
3. **White surfaces:** `#fff` (11x) vs `#ffffff` (8x) — normalize to one
4. **Light borders:** `#ccc` (5x) vs `#ddd` (4x) vs `#e5e7eb` (40x) — pick one

---

## Font Inconsistencies

| Current | Where | Should Be |
|---|---|---|
| `Arial, Helvetica, sans-serif` | HamburgerMenu.js (Menu label) | `'Nunito', sans-serif` |
| `-apple-system, BlinkMacSystemFont...` | index.css | `'Nunito', -apple-system...` |
| `Arial, sans-serif` | HamburgerMenu.css | Should be removed (inherit from body) |

---

## Recommended Token Set

Add this to your `App.css` (already included in the polish files I provided):

```css
:root {
  /* Brand */
  --hb-cream: #fff3e6;
  --hb-cream-dark: #ffe8cc;
  --hb-amber: #f59e0b;
  --hb-amber-hover: #e08e00;
  --hb-amber-light: #fef3c7;
  --hb-amber-dark: #92400e;
  --hb-coral: #E88B6A;

  /* Text */
  --hb-text: #333;
  --hb-text-light: #666;
  --hb-text-muted: #999;

  /* UI */
  --hb-blue: #3b82f6;
  --hb-green: #10b981;
  --hb-red: #ef4444;
  --hb-border: #e5e7eb;
  --hb-white: #ffffff;

  /* Surfaces */
  --hb-gray-50: #f9fafb;
  --hb-gray-100: #f3f4f6;

  /* Feedback */
  --hb-red-bg: #fee2e2;
  --hb-red-text: #991b1b;
  --hb-green-bg: #d1fae5;
  --hb-green-text: #065f46;

  /* Spacing & Shape */
  --hb-radius: 12px;
  --hb-radius-sm: 8px;
  --hb-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --hb-transition: 0.2s ease;
}
```

---

## Migration Plan

**Phase 1 (done):** Token set defined in polished App.css
**Phase 2 (next polish pass):** Migrate App.css, HamburgerMenu.css, Home.js to use tokens
**Phase 3 (gradual):** Migrate Login.js, CheckIn.js, StoryWall.js inline styles
**Phase 4 (when touching files):** Migrate remaining components as you work on them

No need to do this all at once — just use the tokens whenever you touch a file.
