# Monetization Strategy: Dreams & Goals

## Core Concept

Yumeya bridges two powerful human motivators:
1. **Meaningless Dream Memories** (夢の記憶) - Subconscious insights, emotional processing
2. **Absolutely Want to Achieve Goals** (絶対に成し遂げたいこと) - Conscious intentions, life purpose

Both can be monetized through different but complementary approaches.

---

## 1. Dream Memories Monetization

### Value Proposition
- Dreams contain hidden insights about user's psyche
- Analysis reveals patterns, fears, desires
- Emotional processing through dream journaling

### Revenue Streams

#### A. Freemium Model
- **Free**: Basic dream recording, simple tags
- **Premium** (¥980/month):
  - AI-powered dream analysis (Dream-Parse Service)
  - Emotional pattern visualization
  - Similar dream matching
  - Export to jsonl/csv/sqlite for self-analysis

#### B. Dream Analysis Reports
- **One-time purchase** (¥2,980):
  - Monthly dream analysis report (PDF)
  - Yearly pattern analysis
  - Psychological insights based on Japanese BERT analysis

#### C. B2B: Therapist/Dream Analyst Dashboard
- **SaaS** (¥9,800/month):
  - Patient/client dream tracking
  - Anonymized dream pattern analytics
  - HIPAA-compliant data export

---

## 2. Goal Achievement Monetization

### Value Proposition
- Goal hierarchy (Goal > Objective > Key Result) provides structure
- Progress tracking increases success rate
- Integration with daily tools (calendar, tasks)

### Revenue Streams

#### A. Freemium Model
- **Free**: 3 goals, basic kanban view
- **Pro** (¥1,480/month):
  - Unlimited goals
  - Gantt chart view
  - Progress analytics
  - Stripe subscription management (#4)

#### B. Coach/Consultant Marketplace
- **Commission** (20%):
  - Connect users with life coaches
  - Goal accountability partners
  - Expert review of goal structures

#### C. Corporate Training Package
- **Enterprise** (¥50,000/month):
  - Team goal tracking
  - OKR alignment tools
  - Manager dashboard
  - Slack/Microsoft Teams integration

---

## 3. Integrated Monetization: The "Dream-Goal Bridge"

### Unique Value: Connecting Subconscious & Conscious

#### A. Dream-Guided Goal Suggestions (AI)
- Analyze dreams to suggest relevant goals
- "Your dreams show fear of failure → Try 'Build Confidence' goal"
- **Premium feature** (included in ¥1,480/month plan)

#### B. Lucid Dreaming for Goal Visualization
- Guided meditation audio for goal visualization in dreams
- "Practice your presentation in your dreams"
- **Add-on** (¥780/month)

#### C. Subconscious Block Detection
- Detect psychological barriers in dreams that block goal achievement
- "Your dream shows anxiety about public speaking → Goal: Join Toastmasters"
- **Premium insight reports** (¥980/report)

---

## 4. Technical Implementation (Linked to Issues)

| Feature | Issue | Tech Stack | Status |
|---------|-------|------------|--------|
| Subscription payments | #4 | Stripe Checkout + Hono Webhook | 📋 Planned |
| Request validation | #5 | Zod + Hono | 📋 Planned |
| Data export for analysis | #8 | jsonl/csv/SQLite | 📋 Planned |
| Integration testing | #6, #7 | Firestore Emulator + Docker | 📋 Planned |
| AI dream analysis | - | Python FastAPI + BERT | 💡 Future |
| Goal hierarchy UI | - | React + TypeScript | ✅ Active |

---

## 5. Pricing Strategy Summary

```
┌─────────────────────────────────────────┐
│         Yumeya Pricing Tiers           │
├─────────────────────────────────────────┤
│ Free (¥0)                              │
│  - 3 goals, basic dream recording      │
│  - Community support                   │
├─────────────────────────────────────────┤
│ Premium (¥980/month)                   │
│  - Unlimited dreams + AI analysis      │
│  - Advanced goal tracking              │
│  - Dream-Goal bridge insights         │
├─────────────────────────────────────────┤
│ Professional (¥1,480/month)            │
│  - Everything in Premium               │
│  - Gantt charts, analytics            │
│  - Priority support                    │
├─────────────────────────────────────────┤
│ Enterprise (Custom)                    │
│  - Team management                     │
│  - API access                         │
│  - Dedicated account manager           │
└─────────────────────────────────────────┘
```

---

## 6. Success Metrics (KPIs)

### Dream Module
- Daily Active Dream Recorders (DADR)
- Premium conversion rate from free users
- Average dreams analyzed per user/month

### Goal Module
- Goals completed vs. created ratio
- Subscription renewal rate
- Coach marketplace transaction volume

### Integrated
- Dream-to-Goal suggestion acceptance rate
- User lifetime value (LTV)
- Net Promoter Score (NPS)

---

*This document aligns with the architecture decisions (ADR 001-008) and created issues (#4-#8).*
