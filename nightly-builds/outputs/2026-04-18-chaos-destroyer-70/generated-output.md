# West Coast Swing Progress Tracker - Building Chaos Destroyer #70

I'll build a comprehensive West Coast Swing progress tracker for Ben with lesson notes, choreography tracking, and competition prep tools.

```
[FILE: /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-04-18-chaos-destroyer-70/README.md]
```markdown
# West Coast Swing Progress Tracker

A personal tracking system for West Coast Swing dance progress, including lesson notes, choreography management, and competition prep.

## What You Get

- **Lesson Tracker**: Record lesson dates, instructors, focus areas, and notes
- **Choreography Manager**: Track routines, moves, music, and practice status
- **Competition Dashboard**: Monitor prep progress, deadlines, and readiness
- **Progress Analytics**: View improvement over time with charts and statistics
- **Practice Log**: Record daily/weekly practice sessions and metrics
- **Mobile-Friendly**: Works on phone during dance sessions

## Quick Start

### Option 1: Web Dashboard (Recommended)
```bash
cd /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-04-18-chaos-destroyer-70/
python -m http.server 8000
# Open http://localhost:8000
```

### Option 2: CLI Tools
```bash
# Add a new lesson
python scripts/add_lesson.py --date "2026-04-20" --instructor "Sarah" --focus "Underarm turns"

# Log practice session
python scripts/log_practice.py --duration 45 --focus "choreography" --notes "Worked on timing"

# Check progress
python scripts/view_progress.py --timeframe month
```

## File Structure

```
.
├── index.html              # Main dashboard
├── styles/
│   └── main.css           # Styling
├── js/
│   ├── app.js             # Main app logic
│   ├── storage.js         # Local storage management
│   └── analytics.js       # Progress calculations
├── scripts/
│   ├── add_lesson.py      # CLI: Add lesson
│   ├── log_practice.py    # CLI: Log practice
│   ├── view_progress.py   # CLI: View stats
│   └── export_data.py     # CLI: Export/backup
├── data/
│   ├── lessons.json       # Lesson history (auto-created)
│   ├── choreography.json  # Routine tracking
│   ├── competitions.json  # Competition info
│   └── practice_log.json  # Practice sessions
└── README.md
```

## How to Use

### Recording a Lesson
1. Open the dashboard
2. Click "New Lesson"
3. Fill in date, instructor, focus areas
4. Add detailed notes (techniques, challenges, improvements)
5. Save

### Tracking Choreography
1. Go to "Choreography" tab
2. Create new routine with title and music
3. Add individual moves/sequences
4. Mark practice sessions
5. Update mastery level (1-5 stars)

### Competition Prep
1. Add competition in "Competitions" section
2. Set date, venue, routine, categories
3. Break down into milestones
4. Track readiness indicators
5. Get 8-week countdown

### Practice Logging
1. Quick log after each session
2. Duration, focus area, notes
3. Self-assess improvement (1-5)
4. View weekly statistics

## Data Storage

- **Browser**: Uses localStorage (survives page refresh, limited to 5-10MB)
- **Export**: Download JSON backup for archival
- **Sync**: Optional integration with personal cloud storage

## Integration Notes

- **Calendar**: Can export lesson dates to calendar app
- **Music**: Link Spotify/YouTube playlists to choreography
- **Photos/Videos**: Store external links for practice videos
- **Email Reminders**: Set competition deadlines (manual or webhook)

## Features

✅ Lesson tracking with instructor notes  
✅ Choreography mastery levels  
✅ Competition countdown & checklist  
✅ Practice session logging  
✅ Progress charts (weekly, monthly, yearly)  
✅ Mobile responsive  
✅ Data export/backup  
✅ Search and filter  
✅ Goals and milestones  

## Tips for Best Use

1. **After Each Lesson**: Spend 2 minutes recording key points
2. **Practice Logging**: Quick entry—even 30 seconds helps
3. **Weekly Review**: Sunday evening, review week's progress
4. **Competition Mode**: Start prep 8 weeks out
5. **Video Links**: Save links to lesson videos and practice recordings

## Troubleshooting

**Lost data?** Check browser localStorage or restore from exported JSON backup.

**Slow on old device?** Reduce number of practice logs visible, or export old data.

**Want to sync across devices?** Manually export/import JSON, or set up Supabase integration (documented in CODE_INTEGRATION.md).

---

Built with ❤️ for Ben's West Coast Swing journey.
```

```
[FILE: /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-04-18-chaos-destroyer-70/index.html]
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>West Coast Swing Tracker</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1>🎉 West Coast Swing Tracker</h1>
                <p class="subtitle">Lessons • Choreography • Practice • Competitions</p>
            </div>
            <div class="header-actions">
                <button id="exportBtn" class="btn btn-secondary btn-small">💾 Export</button>
                <button id="importBtn" class="btn btn-secondary btn-small">📥 Import</button>
                <input type="file" id="importFile" style="display:none;" accept=".json">
            </div>
        </header>

        <!-- Navigation -->
        <nav class="tabs">
            <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
            <button class="tab-btn" data-tab="lessons">Lessons</button>
            <button class="tab-btn" data-tab="choreography">Choreography</button>
            <button class="tab-btn" data-tab="practice">Practice Log</button>
            <button class="tab-btn" data-tab="competitions">Competitions</button>
            <button class="tab-btn" data-tab="analytics">Analytics</button>
        </nav>

        <!-- Main Content -->
        <main class="main-content">

            <!-- DASHBOARD TAB -->
            <section class="tab-content active" id="dashboard">
                <h2>Dashboard</h2>
                
                <div class="dashboard-grid">
                    <!-- Quick Stats -->
                    <div class="card stats-card">
                        <h3>Quick Stats</h3>
                        <div class="stat-row">
                            <span>Lessons This Month:</span>
                            <strong id="lessonsThisMonth">0</strong>
                        </div>
                        <div class="stat-row">
                            <span>Practice Hours This Week:</span>
                            <strong id="practiceHoursWeek">0h</strong>
                        </div>
                        <div class="stat-row">
                            <span>Choreographies Learned:</span>
                            <strong id="choreographiesCount">0</strong>
                        </div>
                        <div class="stat-row">
                            <span>Days Until Next Competition:</span>
                            <strong id="daysUntilCompetition">—</strong>
                        </div>
                    </div>

                    <!-- Recent Lessons -->
                    <div class="card">
                        <h3>📚 Recent Lessons</h3>
                        <div id="recentLessons" class="list-compact">
                            <p class="empty-state">No lessons yet. Add one to get started!</p>
                        </div>
                        <button class="btn btn-primary" onclick="switchTab('lessons')">View All</button>
                    </div>

                    <!-- Upcoming Competitions -->
                    <div class="card">
                        <h3>🏆 Upcoming Competitions</h3>
                        <div id="upcomingCompetitions" class="list-compact">
                            <p class="empty-state">No competitions scheduled.</p>
                        </div>
                        <button class="btn btn-primary" onclick="switchTab('competitions')">View All</button>
                    </div>

                    <!-- Quick Log Practice -->
                    <div class="card">
                        <h3>⚡ Quick Log Practice</h3>
                        <div class="form-group">
                            <input type="number" id="quickDuration" placeholder="Duration (minutes)" min="1">
                        </div>
                        <div class="form-group">
                            <select id="quickFocus">
                                <option value="">Select focus area...</option>
                                <option value="choreography">Choreography</option>
                                <option value="technique">Technique</option>
                                <option value="musicality">Musicality</option>
                                <option value="connection">Connection</option>
                                <option value="freestyle">Freestyle</option>
                                <option value="competition">Competition Prep</option>
                            </select>
                        </div>
                        <button class="btn btn-success" onclick="quickLogPractice()">Log Practice</button>
                    </div>
                </div>

                <!-- Progress Chart -->
                <div class="card full-width">
                    <h3>📊 Weekly Progress</h3>
                    <canvas id="progressChart"></canvas>
                </div>
            </section>

            <!-- LESSONS TAB -->
            <section class="tab-content" id="lessons">
                <div class="section-header">
                    <h2>Lesson Tracker</h2>
                    <button class="btn btn-primary" onclick="openLessonForm()">+ Add Lesson</button>
                </div>

                <!-- Add/Edit Lesson Form -->
                <div id="lessonFormContainer" class="card form-card" style="display:none;">
                    <h3>Record Lesson</h3>
                    <form id="lessonForm" onsubmit="saveLesson(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" id="lessonDate" required>
                            </div>
                            <div class="form-group">
                                <label>Instructor</label>
                                <input type="text" id="lessonInstructor" placeholder="e.g., Sarah, Robert" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Primary Focus Areas</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="Underarm Turns"> Underarm Turns</label>
                                <label><input type="checkbox" value="Spins"> Spins</label>
                                <label><input type="checkbox" value="Timing"> Timing</label>
                                <label><input type="checkbox" value="Connection"> Connection</label>
                                <label><input type="checkbox" value="Footwork"> Footwork</label>
                                <label><input type="checkbox" value="Styling"> Styling</label>
                                <label><input type="checkbox" value="Musicality"> Musicality</label>
                                <label><input type="checkbox" value="Choreography"> Choreography</label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Lesson Notes</label>
                            <textarea id="lessonNotes" placeholder="What did you learn? What needs work?" rows="6"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Difficulty/Intensity (1-5)</label>
                            <input type="range" id="lessonIntensity" min="1" max="5" value="3">
                            <span id="intensityValue">3</span>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-success">Save Lesson</button>
                            <button type="button" class="btn btn-secondary" onclick="closeLessonForm()">Cancel</button>
                        </div>
                    </form>
                </div>

                <!-- Lessons List -->
                <div id="lessonsList" class="lessons-list">
                    <p class="empty-state">No lessons recorded yet.</p>
                </div>
            </section>

            <!-- CHOREOGRAPHY TAB -->
            <section class="tab-content" id="choreography">
                <div class="section-header">
                    <h2>Choreography Manager</h2>
                    <button class="btn btn-primary" onclick="openChoreographyForm()">+ New Routine</button>
                </div>

                <!-- Add/Edit Choreography Form -->
                <div id="choreographyFormContainer" class="card form-card" style="display:none;">
                    <h3>Add/Edit Routine</h3>
                    <form id="choreographyForm" onsubmit="saveChoreography(event)">
                        <div class="form-group">
                            <label>Routine Name</label>
                            <input type="text" id="choreTitle" placeholder="e.g., Quickstep Jive Mix" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Music Title</label>
                                <input type="text" id="choreMusic" placeholder="Song title">
                            </div>
                            <div class="form-group">
                                <label>Duration (seconds)</label>
                                <input type="number" id="choreDuration" min="30" max="300">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Key Moves/Sequences</label>
                            <textarea id="choreMoves" placeholder="List main choreography elements&#10;e.g., - Push break with underarm turn&#10;- 6-count whip&#10;- Spin combo" rows="5"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Practice Status</label>
                            <select id="choreStatus" required>
                                <option value="learning">Learning</option>
                                <option value="practicing">Practicing</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="mastered">Mastered</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Mastery Level (1-5 stars)</label>
                            <div class="star-rating" id="masteryStars">
                                <span class="star" data-value="1">★</span>
                                <span class="star" data-value="2">★</span>
                                <span class="star" data-value="3">★</span>
                                <span class="star" data-value="4">★</span>
                                <span class="star" data-value="5">★</span>
                            </div>
                            <input type="hidden" id="choremastery" value="3">
                        </div>

                        <div class="form-group">
                            <label>Notes/Resources</label>
                            <textarea id="choreNotes" placeholder="Links to videos, instructor notes, etc." rows="4"></textarea
