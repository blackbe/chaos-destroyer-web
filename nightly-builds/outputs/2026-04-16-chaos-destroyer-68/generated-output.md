# Reconnection Toolkit v3 — Delilah Edition

I'm building a practical toolkit for Ben to organize and track reconnection efforts with Delilah. This will include templates, a tracking system, and actionable prompts.

---

## PROJECT STRUCTURE

```
2026-04-16-chaos-destroyer-68/
├── README.md
├── templates/
│   ├── message-templates.md
│   ├── conversation-starters.md
│   └── follow-up-sequences.md
├── tracker/
│   ├── reconnection-log.json
│   ├── interaction-tracker.js
│   └── reminder-system.js
├── utils/
│   ├── contact-helper.js
│   └── sentiment-analyzer.js
└── dashboard.html
```

---

## FILES

```
[FILE: README.md]
```markdown
# Reconnection Toolkit v3 — Delilah Edition

A practical system for organizing and tracking reconnection efforts with intentionality and follow-through.

## What's Included

1. **Message Templates** — Pre-written, context-aware message starters
2. **Conversation Starters** — Natural openers for different scenarios
3. **Follow-up Sequences** — Structured approach to multi-message conversations
4. **Interaction Tracker** — JSON-based log of all outreach attempts
5. **Reminder System** — Automated prompts for follow-up timing
6. **Sentiment Analyzer** — Quick mood/tone check before sending
7. **Dashboard** — Visual overview of reconnection progress

## Quick Start

### 1. View Templates
```bash
cat templates/message-templates.md
cat templates/conversation-starters.md
cat templates/follow-up-sequences.md
```

### 2. Log an Interaction
```bash
node tracker/interaction-tracker.js --log "message" --channel "instagram" --response "positive"
```

### 3. Check Reminders
```bash
node tracker/reminder-system.js
```

### 4. View Dashboard
Open `dashboard.html` in your browser for visual overview.

## Integration Points

### Email Integration
- If you send an email, manually log it: `node tracker/interaction-tracker.js --log "email" --channel "email"`

### Calendar Integration
- Set calendar reminders 3, 7, and 14 days after each interaction
- Script can pull from Supabase if needed

### Supabase (Optional)
- Could sync tracker data to `reconnection_logs` table
- Currently runs locally in JSON

## Usage Patterns

### Daily Workflow
1. Open dashboard.html to see status
2. Pick a template from templates/message-templates.md
3. Use sentiment-analyzer.js if unsure about tone
4. Send message on your preferred platform
5. Log interaction with `interaction-tracker.js`
6. Set 7-day reminder for follow-up

### Weekly Review
```bash
node tracker/reminder-system.js --report
```

## File Descriptions

| File | Purpose |
|------|---------|
| `message-templates.md` | 12 ready-to-use message templates |
| `conversation-starters.md` | Natural openers for different contexts |
| `follow-up-sequences.md` | 3-message, 5-message, and ongoing sequences |
| `interaction-tracker.js` | Log every interaction with metadata |
| `reminder-system.js` | Generate reminders based on timing rules |
| `contact-helper.js` | Quick reference for Delilah info |
| `sentiment-analyzer.js` | Check tone before sending |
| `dashboard.html` | Visual tracker and overview |

## Tips for Success

- **Be Consistent**: Log every interaction, even if response is negative
- **Don't Rush**: Follow the 7-day rule — give time between messages
- **Track Sentiment**: Use analyzer before sending anything emotional
- **Review Weekly**: Check dashboard to spot patterns
- **Respect Boundaries**: If negative responses occur, increase wait time

## Data Schema

All interactions stored in `tracker/reconnection-log.json`:
```json
{
  "interactions": [
    {
      "id": "uuid",
      "date": "2026-04-16T10:30:00Z",
      "type": "message|call|email|in-person",
      "channel": "instagram|text|email|phone|in-person",
      "content_preview": "Hey, how have you been...",
      "response": "positive|neutral|negative|no-response",
      "response_time_hours": 12,
      "notes": "User notes here",
      "next_action": "follow-up in 7 days",
      "next_action_date": "2026-04-23T10:30:00Z"
    }
  ]
}
```

## No External Dependencies (by design)

This is intentionally lightweight:
- Pure JavaScript (Node.js)
- JSON for storage
- HTML for dashboard
- No npm packages needed
- All runs locally

## Future Enhancements

- Supabase sync for backup
- Email notification for reminders
- Sentiment trends over time
- Response rate analytics
- Template effectiveness scoring
```

---

```
[FILE: templates/message-templates.md]
```markdown
# Message Templates — Delilah Edition

**How to use**: Pick a template that matches your context, customize the bracketed sections with specific details, and run through the sentiment analyzer before sending.

---

## 1. CASUAL RECONNECTION (Low Pressure)

**Use when**: You haven't talked in 2+ weeks and want to ease back in

```
Hey! I was thinking about [specific memory: that time we...] and wanted to check in. 
How have you been? [Optional: I miss our conversations]
```

**Example**:
```
Hey! I was thinking about that night we got coffee and talked about your design projects, 
and wanted to check in. How have you been? I miss our conversations.
```

---

## 2. SPECIFIC REFERENCE (Higher Intent)

**Use when**: You want to show you pay attention and remember details

```
I saw [specific thing: a post/article/event] that made me think of you and your [interest/project]. 
How's that [project] going? Would love to catch up.
```

**Example**:
```
I saw a post about the new design conference happening next month that made me think of you 
and your focus on UX. How's the portfolio coming along? Would love to catch up.
```

---

## 3. VALUE-ADD MESSAGE (She benefits first)

**Use when**: You have something useful to share, not just reconnecting

```
Found this [resource/article/opportunity] and immediately thought of you and [context].
Thought you'd find it interesting. Let me know what you think!
```

**Example**:
```
Found this article about AI tools for designers and immediately thought of you. 
Thought you'd find it interesting. Let me know what you think!
```

---

## 4. HONEST & DIRECT (Medium Vulnerability)

**Use when**: You want to be real without being heavy

```
I realized I haven't reached out in a while and that's on me. I've been [context], 
but I'd really like to catch up. No pressure if you're busy, but would be great to hear from you.
```

**Example**:
```
I realized I haven't reached out in a while and that's on me. I've been swamped with work, 
but I'd really like to catch up. No pressure if you're busy, but would be great to hear from you.
```

---

## 5. QUESTION-BASED (Engagement Hook)

**Use when**: You want her to respond naturally by asking something genuine

```
I have a question I think you'd have a good perspective on: [thoughtful question about her interests].
Would love your input.
```

**Example**:
```
I have a question I think you'd have a good perspective on: when you're working on a big creative project, 
how do you handle the self-doubt that comes with it? Would love your input.
```

---

## 6. EVENT-BASED (Natural Opener)

**Use when**: Something in her world or news gives you a reason to reach out

```
Saw that [event/news/milestone] is happening for you. That's awesome! 
[Relevant comment about it]. How are you feeling about it?
```

**Example**:
```
Saw that you hit 5K followers on your design account. That's awesome! 
You absolutely deserve that recognition. How are you feeling about it?
```

---

## 7. MEMORY LANE (Nostalgic, Safe)

**Use when**: You want warmth without being forward

```
Random thought: do you remember [shared memory]? I was [context] and it just hit me. 
Those were good times. How's life treating you these days?
```

**Example**:
```
Random thought: do you remember that road trip we took and got completely lost? 
I was listening to that playlist and it just hit me. Those were good times. 
How's life treating you these days?
```

---

## 8. COLLABORATIVE OFFER (Shared Interest)

**Use when**: You can work on or do something together

```
I'm [working on/interested in] [topic] and immediately thought you'd be a great person to 
[brainstorm/discuss/collaborate] on this with. Interested?
```

**Example**:
```
I'm working on a passion project about creative careers and immediately thought you'd be 
a great person to interview or brainstorm with. Interested?
```

---

## 9. GENUINE COMPLIMENT (Low Risk, High Warmth)

**Use when**: You have real appreciation you haven't expressed

```
I've been thinking lately about [specific quality of hers] and how much I appreciate that about you. 
Wanted you to know. How are you doing?
```

**Example**:
```
I've been thinking lately about how thoughtful and creative you are, 
and how much I genuinely appreciate that about you. Wanted you to know. 
How are you doing?
```

---

## 10. SOLUTION TO SHARED PROBLEM

**Use when**: You have something that could actually help her

```
Remember how you mentioned [problem]? I found [solution/resource] and wanted to pass it along. 
Thought of you. Let me know if it helps!
```

**Example**:
```
Remember how you mentioned struggling with client communication? 
I found this course and wanted to pass it along. Thought of you. 
Let me know if it helps!
```

---

## 11. SIMPLE & WARM (Lowest Barrier)

**Use when**: You want to keep it super light and easy

```
Hey! Been a minute. Hope you're doing well. What's new with you?
```

---

## 12. ACCOUNTABILITY + CONNECTION (Medium Depth)

**Use when**: You want to acknowledge time apart while being genuine

```
I'm trying to be better about staying in touch with people I care about, 
and you're definitely one of those people. How are things going?
```

---

## TEMPLATE SELECTION GUIDE

| Situation | Template | Wait Time After |
|-----------|----------|-----------------|
| Haven't talked in 1 week | #1, #11 | 7 days |
| Haven't talked in 2-4 weeks | #2, #7, #9 | 7 days |
| Haven't talked in 1+ month | #4, #12 | 7-10 days |
| You have something relevant | #3, #5, #10 | 5 days |
| You see her news/updates | #6, #8 | 3 days |
| Just want to reach out | #1, #11 | 7 days |

---

## TONE CHECKLIST BEFORE SENDING

- [ ] Does it feel authentic to how I actually talk?
- [ ] Would I be uncomfortable if she showed this to someone?
- [ ] Is it pressuring her to respond?
- [ ] Does it lead with her, not with my needs?
- [ ] Is it concise (no wall of text)?
- [ ] Did I read it out loud to check the vibe?

```

---

```
[FILE: templates/conversation-starters.md]
```markdown
# Conversation Starters — Context-Specific Opens

Pick the starter that matches your current situation, then use a template from message-templates.md to build the full message.

---

## AFTER A LONG SILENCE (2+ weeks)

**Vibe**: Apologetic but light, acknowledging the gap without making it weird

```
Hey! I know it's been a minute...
```

```
So I'm terrible at staying in touch, but I was just thinking about you...
```

```
Random, but I was scrolling and saw [thing] and thought of you. Haven't checked in in forever...
```

```
I've been in my own head lately, but I realized I haven't talked to you in ages...
```

---

## AFTER SEEING HER ACTIVITY (Social Media, News, etc.)

**Vibe**: Genuine interest, shows you're paying attention

```
Saw your latest post about [topic] and it caught my attention...
```

```
I keep seeing your work pop up and I'm genuinely impressed...
```

```
Noticed you've been [doing thing] and that's so cool...
```

```
Your [post/update/project] made me think about [related thing]...
```

---

## WHEN YOU HAVE ACTUAL NEWS

**Vibe**: Excited, gives her something to respond to

```
Something happened and you were literally one of the first people I thought to tell...
```

```
This might sound random but I wanted to run something by you because I respect your take...
```

```
I'm working on [thing] and your perspective would mean a lot...
```

---

## WHEN YOU MISS THEM (VULNERABLE)

**Vibe**: Honest, a little raw, but not desperate

```
Not gonna lie, I've missed talking to you...
```

```
I was thinking about [memory] and realized how much I miss those conversations...
```

```
This is random but I was talking to someone and realized you'd have such a good take on this...
```

```
I've been meaning to reach out for a while now...
```

---

## CASUAL & LIGHT

**Vibe**: Zero pressure, just checking in

```
What's good with you?
```

```
How's life been treating you?
```

```
Long time! What's new?
```

```
You alive over there? 😊
```

---

## ASKING FOR INPUT (HER EXPERTISE)

**Vibe**: Values her opinion, makes her feel smart

```
Can I get your perspective on something?
```

```
You'd probably have a really good take on this...
```

```
I need to pick someone's brain and you're literally the perfect person...
```

```
Quick question for you...
```

---

## SHARING SOMETHING MEANINGFUL

**Vibe**: Warm, intentional, shows depth

```
I was thinking about something you once told me...
```

```
This reminded me of a conversation we had...
```

```
You probably don't realize how much [thing you said] stuck with me...
```

```
I was reading this and thought about you specifically...
```

---

## COMING BACK AFTER DISTANCE

**Vibe**: Honest about absence, not making excuses, moving forward

```
I've been kind of absent and that's not cool...
```

```
I know I've been MIA but I want to change that...
```

```
I regret letting so much time pass without checking in...
```

```
Real talk: I should have reached out sooner...
```

---

## COMBINATION STARTERS (Chain 2-3 Together)

**Pattern 1: Acknowledgment + Memory + Forward**
```
So I haven't talked to you in forever [Acknowledgment]
and I was just thinking about [memory] [Memory]
wanted to see how you're doing [Forward]
```

**Pattern 2: Vulnerability + Specific Reference + Question**
```
Not gonna lie, I miss talking to you [Vulnerability]
especially about stuff like [specific topic] [Reference]
how have you been? [Question]
```

**Pattern 3: Apology + Reason + Interest**
```
I realize I've been terrible at staying in touch [Apology]
life's been [context] [Reason]
but I genuinely want to catch up [Interest]
```

---

## CONVERSATION STARTER DECISION TREE

```
"How long since last contact?"
├─ < 1 week → Use casual + light starters
├─ 
