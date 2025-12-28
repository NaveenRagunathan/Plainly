# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Minimal Email Automation Platform (MEAP)

Plainly ✨ (My #1 Pick)

Domain: plainly.email or plainly.io
Why it works: Signals plain-text focus, simplicity, and honesty
Tagline: "Email marketing that doesn't overthink it"
Vibe: Modern, confident, direct
Memorable: Yes, easy to say and spell


**Status:** Market-Validated, Ready for Design  
**Last Updated:** December 28, 2025  
**Validation Source:** Reddit, LinkedIn, Industry Research

---

## EXECUTIVE SUMMARY

MEAP is an email marketing platform designed for solo creators and freelancers who are **overwhelmed by complex tools** and **priced out by expensive alternatives**. We solve the "Kit is too expensive, ActiveCampaign is too complex" problem.

**Market Validation:**
- Kit's 34% price increase created immediate migration opportunity
- 37% of ex-Kit users cite pricing as their #1 complaint
- Plain-text emails outperform HTML in engagement (21% higher click-to-open rate)
- Solo creators explicitly request "simpler sequence builders" over visual automation

**Positioning:** "Kit-level automation at SendFox-level pricing"

---

## TARGET USER PROFILE

### Primary Persona: "The Focused Creator"

**Demographics:**
- Solo creator, freelancer, or consultant
- 100–5,000 email subscribers
- $0–$2,000/mo revenue from content/services
- No marketing team or technical support

**Psychographics:**
- Values **simplicity over sophistication**
- Willing to trade advanced features for **predictable low cost**
- Frustrated by visual automation builders ("overkill for what I need")
- Prefers plain-text, personal emails over designed newsletters
- Time-constrained: wears all hats in their business

**Current Behavior:**
- Using Kit, MailerLite, or ConvertKit
- Only uses 20% of features in current tool
- Manually sends broadcasts, rarely uses advanced automation
- Considers email marketing a "necessary evil" not core strength

**Jobs to Be Done:**
1. Capture emails from website/social media
2. Send automatic welcome series to new subscribers
3. Send occasional updates/broadcasts to entire list
4. Not lose money on email tool as list grows

---

## CORE VALUE PROPOSITION

### What We Are:
**"Email marketing that doesn't overthink it."**

Simple, linear automation + reliable broadcasts + predictable pricing = freedom to focus on creating content.

### What We Are NOT:
- Not a CRM
- Not a cold email tool
- Not an enterprise marketing suite
- Not a visual automation builder

---

## PRICING MODEL (VALIDATED)

### Subscription Tiers:

**Starter: $19/month**
- Up to 5,000 subscribers
- Unlimited broadcasts
- Unlimited sequences
- Landing pages
- Basic analytics

**Growth: $39/month**
- Up to 25,000 subscribers
- Everything in Starter
- Priority email support
- A/B testing (subject lines only)

**Lifetime: $49 one-time**
- Up to 2,000 subscribers (hard cap)
- All features included
- Lifetime support
- No future charges

### Pricing Philosophy:
- **Flat pricing** until subscriber cap exceeded
- No usage-based billing surprises
- No hidden costs for "premium features"
- Forced upgrade only when subscriber limit reached
- No free tier (prevents abuse, supports sustainability)

**Competitive Analysis:**
- Kit charges $75/mo for 5,000 subscribers (we're 75% cheaper)
- MailerLite charges $35/mo for 5,000 subscribers (we're 46% cheaper)
- SendFox offers $49 lifetime but limited automation (we match price, exceed features)

---

## FEATURE SET: IN-SCOPE

### ✅ 1. SUBSCRIBER MANAGEMENT

**What It Does:**
- Collect email addresses via landing page forms
- Store subscriber data (email, first name, tags, status)
- Track subscription status (active, unsubscribed, bounced)
- Organize subscribers using tags
- Handle unsubscribes gracefully

**Key Capabilities:**
- One-click unsubscribe link in every email
- Unsubscribe from sequences (can still receive broadcasts)
- Manual subscriber import via CSV
- Export entire list anytime (data portability)
- Automatic bounce handling (marks subscriber as bounced)

**Design Principles:**
- No duplicate emails per account
- Tags don't trigger actions (they're for organization + filtering)
- Subscriber owns their data (easy export)

**Validation:**
- Standard table-stakes feature
- Tag-based organization sufficient for solo creators

---

### ✅ 2. EMAIL SEQUENCES (LINEAR AUTOMATION)

**What It Does:**
- Create multi-step email sequences that run automatically
- Each sequence is a **linear series of emails** with time delays
- Subscriber enters sequence and progresses step-by-step
- Sequence completes when last email is sent

**Sequence Rules (HARD CONSTRAINTS):**
- ✅ Linear only (Step 1 → Step 2 → Step 3)
- ❌ No branching ("if clicked, send X, else send Y")
- ❌ No parallel sequences (one sequence per subscriber at a time)
- ❌ No loops, jumps, or conditions
- ✅ Simple time delays (hours between emails)

**How Subscribers Enter Sequences:**
1. **On signup** (assign sequence to landing page)
2. **Manual assignment** (creator adds subscriber to sequence)
3. **Tag-based trigger** (only if subscriber not already in a sequence)

**Sequence Configuration:**
- Name the sequence
- Add/edit/reorder steps
- Each step has:
  - Delay from previous step (in hours)
  - Email subject line
  - Email body (plain text)
- Preview entire sequence flow

**Sequence Behavior:**
- Subscriber can only be in ONE sequence at a time
- New sequence assignment fails if subscriber already active in another
- Unsubscribe removes from sequence (doesn't affect broadcast eligibility)
- When sequence completes, subscriber state clears

**Example Use Cases:**
- 5-day welcome series for new subscribers
- 7-day course delivered via email
- 3-email product launch sequence

**Validation:**
- ✅ Users explicitly requested "simpler sequence builders"
- ✅ Visual automation builders are "overkill for simple drip sequences"
- ✅ Linear sequences cover 90% of solo creator needs

---

### ✅ 3. BROADCASTS (ONE-OFF EMAILS)

**What It Does:**
- Send one-time emails to entire list or filtered segment
- Schedule for future delivery or send immediately
- Target specific subscriber groups using tags

**Broadcast Creation:**
1. Write subject line
2. Write email body (plain text)
3. Choose recipients:
   - All active subscribers
   - Filter by tags (AND/OR logic)
   - Exclude subscribers currently in sequences
4. Send now or schedule for specific date/time (UTC)

**Broadcast Scheduling:**
- Pick date and time (UTC timezone only)
- Queued broadcasts can be edited before send time
- Cancel scheduled broadcast anytime before send
- View scheduled broadcasts in dashboard

**Broadcast Analytics:**
- Total sent
- Opened (unique opens)
- Clicked (unique clicks on any link)
- Unsubscribed
- Bounced

**Design Principles:**
- Broadcasts respect unsubscribe status
- Broadcasts bypass sequence logic (can send to anyone active)
- No automatic resends or follow-ups
- No conditional content based on subscriber data

**Validation:**
- ✅ Core feature, universally expected
- ✅ UTC-only scheduling is acceptable tradeoff for simplicity

---

### ✅ 4. LANDING PAGES

**What It Does:**
- Pre-built, hosted pages for capturing email subscribers
- No page builder, no custom domains, no styling editor
- Friction-free setup (creator picks template, goes live)

**Template Options:**
- 5 pre-designed templates:
  1. Minimal (centered form, headline, subheadline)
  2. Side-by-side (image left, form right)
  3. Full-width hero (background image, overlay form)
  4. Two-column (benefits left, form right)
  5. Video embed (YouTube/Vimeo + form below)

**Customization (Limited by Design):**
- Headline text
- Subheadline text
- Button text ("Subscribe" / "Get Access" / "Join Now")
- Optional: Upload header image or background image
- Optional: Privacy policy link
- Optional: Social proof text ("Join 1,247 readers")

**Form Configuration:**
- Required: Email field
- Optional: First name field
- Optional: Assign tag on signup
- Optional: Assign sequence on signup

**Hosting:**
- Hosted at: `[username].meap.site/[page-slug]`
- SSL included
- Mobile responsive (automatic)
- No custom domain support (v1)

**After Signup:**
- Show success message
- Optional: Redirect to external URL
- Subscriber added to system immediately
- Confirmation email sent (if sequence assigned)

**Design Principles:**
- No visual page builder (reduces complexity, support burden)
- Templates are tested for conversion, not customization
- Hosted subdomain prevents DNS/SSL support costs
- Focus on "good enough" over "pixel perfect"

**Validation:**
- ✅ Standard expectation for email platforms
- ✅ Limited customization acceptable for price point
- ✅ Subdomain hosting common at this tier

---

### ✅ 5. EMAIL COMPOSITION (PLAIN TEXT ONLY)

**What It Does:**
- Simple text editor for writing emails
- No HTML editor, no drag-and-drop, no templates
- Focus on personal, conversational emails

**Editor Features:**
- Plain text input field
- **Basic formatting preserved:**
  - Line breaks
  - Paragraphs
  - Bullet points (converted to plain text)
  - Links (auto-detected, clickable in email)
- **Merge tags supported:**
  - `{first_name}` → Subscriber's first name
  - `{email}` → Subscriber's email
  - Fallback to "there" if name is empty
- **Automatic footer appended:**
  - Unsubscribe link (tokenized, secure)
  - Sender address
  - Compliance text

**Why Plain Text Only:**
- Higher engagement (21% better click-to-open rate)
- Better deliverability (less likely to hit spam)
- Feels personal, like email from a friend
- No design work required (faster to write)
- Accessible by default (screen readers, no images)

**Design Principles:**
- Optimize for writing speed, not design complexity
- Trust that personal beats polished
- Eliminate decision fatigue (no font choices, colors, layouts)

**Validation:**
- ✅ Plain text emails outperform HTML in A/B tests
- ✅ Creates "one-on-one conversation" feeling
- ✅ Aligns with solo creator simplicity values

---

### ✅ 6. ANALYTICS DASHBOARD (BASIC)

**What It Shows:**

**Overview Metrics:**
- Total active subscribers
- Subscribers added (last 7/30 days)
- Emails sent (last 7/30 days)
- Average open rate
- Average click rate

**Broadcast Performance:**
- List of recent broadcasts
- For each: sent count, open rate, click rate, unsubscribes
- Click on broadcast to see detailed stats

**Sequence Performance:**
- List of active sequences
- For each: total enrolled, currently active, completed
- Step-by-step breakdown (sent, opened, clicked per step)

**Subscriber Growth Chart:**
- Line graph showing subscriber count over time (last 90 days)
- Mark key events (broadcast sent, sequence launched)

**What It Does NOT Show:**
- Individual subscriber behavior tracking
- Geographic data
- Device/client breakdown
- Engagement scoring
- Heatmaps or advanced visualizations

**Design Principles:**
- Show enough to make decisions, not everything possible
- Focus on actionable metrics (open/click rates, growth trends)
- Avoid analysis paralysis with too many charts

**Validation:**
- ✅ Users complain when reporting is "too simple and not insightful"
- ✅ Basic analytics are table stakes, must include
- ⚠️ Keep simple to avoid scope creep

---

### ✅ 7. A/B TESTING (SUBJECT LINES ONLY)

**What It Does:**
- Test two subject lines against each other in broadcasts
- System automatically splits audience, tracks winner

**How It Works:**
1. Creator writes two subject lines (A and B)
2. Choose test size (10%, 20%, or 30% of list)
3. Choose winning metric (open rate or click rate)
4. Choose wait time (2, 4, or 6 hours)
5. System sends test to sample, tracks performance
6. After wait time, winning subject sent to remainder of list

**Limitations (By Design):**
- Subject lines only (not body content, not send time)
- Broadcasts only (not sequences)
- Binary test only (A vs B, not A/B/C)
- Automatic winner selection (no manual override)

**Design Principles:**
- Solve the highest-leverage test (subject lines drive opens)
- Automate decision-making (remove analysis paralysis)
- One feature done well beats many features done poorly

**Validation:**
- ✅ Users specifically frustrated Kit "only covers subject lines" (we match this)
- ✅ Subject line testing is highest ROI for solo creators
- ✅ Body content testing adds complexity without proportional value

---

### ✅ 8. INTEGRATIONS (STRIPE ONLY - V1)

**What It Does:**
- Connect Stripe account to accept payments
- Sell digital products directly from emails
- Tag buyers automatically

**Stripe Integration Features:**
- One-click Stripe Connect setup
- Create payment links for digital products
- Embed payment links in broadcasts or sequences
- Auto-tag subscribers who purchase
- View revenue dashboard (total sales, products sold)

**Use Cases:**
- Sell ebook from welcome sequence
- Promote paid course in broadcast
- Offer consulting packages via email
- Automatically segment buyers from non-buyers (via tags)

**What It Does NOT Do:**
- No built-in course hosting
- No file delivery management (use external service)
- No subscription billing (one-time payments only in v1)
- No abandoned cart sequences (out of scope)

**Design Principles:**
- Monetization is critical for creator sustainability
- Stripe is industry standard (don't reinvent payments)
- Keep payment flow simple (link-based, not embedded checkout)
- Tag-based segmentation enables manual follow-up

**Validation:**
- ✅ Creators value "built-in monetization" features
- ✅ Stripe integration is competitive necessity
- ✅ Simple payment links sufficient for v1

---

## FEATURE SET: OUT-OF-SCOPE (V1)

### ❌ 1. Visual Automation Builder
**Why Not:**
- Adds significant complexity (development + support)
- Solo creators find these "overwhelming" and "overkill"
- Linear sequences solve 90% of use cases
- Would increase pricing to cover dev costs

**Alternative:** Linear sequences with clear step-by-step UI

---

### ❌ 2. HTML Email Editor
**Why Not:**
- Plain text performs better (validated by research)
- Eliminates design decisions (faster workflow)
- Better deliverability (less spam filtering)
- No cross-client rendering issues (Gmail, Outlook, etc.)

**Alternative:** Plain text editor with merge tags

---

### ❌ 3. Custom Domains for Landing Pages
**Why Not:**
- Requires DNS support (costly, time-consuming)
- Requires SSL certificate management per domain
- Subdomain hosting sufficient for price point
- Power users can redirect their domain to our subdomain

**Alternative:** Branded subdomains (username.meap.site)

---

### ❌ 4. Multi-Sequence Concurrency
**Why Not:**
- Increases system complexity exponentially
- Introduces conflict resolution problems (which sequence takes priority?)
- Solo creators rarely need parallel nurture tracks
- Linear sequences + broadcasts cover use cases

**Alternative:** One sequence at a time + broadcasts for announcements

---

### ❌ 5. Conditional Logic / Branching
**Why Not:**
- Visual automation builder required to make usable
- Majority of creators don't use advanced automation
- Debugging logic flows creates support burden
- Significantly increases development time

**Alternative:** Tag-based filtering for broadcasts

---

### ❌ 6. Timezone-Aware Delivery
**Why Not:**
- Requires storing subscriber timezone (more data, privacy concerns)
- Adds complexity to queue scheduling
- UTC scheduling acceptable for price point
- Most solo creators have audience in 1–2 timezones

**Alternative:** UTC scheduling with best-practice recommendations

---

### ❌ 7. Team Accounts / Multi-User Access
**Why Not:**
- Out of scope for "solo creator" positioning
- Requires permission system (read/write/admin roles)
- Introduces billing complexity (per-seat pricing?)
- Would need audit logs, activity tracking

**Alternative:** Single user per account (v1)

---

### ❌ 8. SMS / Push Notifications
**Why Not:**
- Entirely different cost structure (per-message pricing)
- Regulatory complexity (TCPA compliance, carrier regulations)
- Outside core "email automation" focus
- Would require separate infrastructure

**Alternative:** Email-only focus

---

### ❌ 9. Built-In Affiliate Program Management
**Why Not:**
- Complex feature requiring link tracking, commission calculation, payout system
- Niche use case (not all creators run affiliate programs)
- Third-party tools (Rewardful, Tapfiliate) exist and integrate easily
- Scope creep risk

**Alternative:** Integration-friendly (webhook support for external tools)

---

### ❌ 10. Advanced Segmentation / Lead Scoring
**Why Not:**
- Tag-based filtering covers 80% of solo creator needs
- Lead scoring requires behavioral tracking at scale
- Analysis paralysis risk (too many options)
- Better suited for sales teams, not creators

**Alternative:** Simple tag-based filtering

---

## ABUSE PREVENTION & SAFETY

### Daily Send Caps (Hard Limits)
- **Starter Plan:** 25,000 emails/day
- **Growth Plan:** 125,000 emails/day
- **Lifetime Plan:** 10,000 emails/day

**Behavior When Cap Exceeded:**
- Emails queued for next day (no lost sends)
- Creator notified via email + dashboard alert
- Manual pause available (creator can stop all sends)

### Spam Prevention
- **Opt-in only** (no purchased lists, no cold email)
- **Double opt-in** encouraged (but optional)
- **Unsubscribe link** in every email (required, non-removable)
- **Bounce handling** (auto-disable bounced addresses)
- **Complaint monitoring** (track spam complaints, flag accounts)

### Account Suspension Triggers
- High complaint rate (>0.5%)
- Purchased list detected (manual review)
- Terms of Service violation (spamming, cold outreach)
- Payment failure (grace period: 7 days)

**Design Principles:**
- Protect platform reputation (sender score affects all users)
- Balance prevention with false positives (don't punish good actors)
- Manual review for edge cases (human judgment when needed)

---

## EMAIL DELIVERY INFRASTRUCTURE

### Provider Strategy
- **ESP abstraction layer** (provider-agnostic interface)
- **Primary providers:** Resend, Postmark, or AWS SES
- **Fallback redundancy:** Switch providers if one degrades

### Deliverability Requirements
- SPF, DKIM, DMARC setup (automated)
- Shared IP pools (cost-effective for scale)
- Dedicated IPs (available for Growth plan, optional upgrade)
- Bounce handling (hard bounces auto-disable)
- Complaint feedback loops (monitor spam reports)

### Email Content Rules
- Plain text only (simplifies rendering, improves deliverability)
- Automatic footer (unsubscribe, physical address, compliance)
- Link tracking (click analytics via redirect)
- Open tracking (1x1 pixel, privacy-conscious)

**Design Principles:**
- Deliverability is non-negotiable (table stakes)
- Provider abstraction enables quick migration if needed
- Shared IPs acceptable for solo creators (not sending millions/day)

---

## TECHNICAL CONSTRAINTS (FOR DESIGN TEAM)

### Performance Requirements
- Landing page load time: <2 seconds
- Dashboard load time: <3 seconds
- Email send within 5 minutes of broadcast click (immediate sends)
- Sequence emails sent within 15 minutes of scheduled time

### Scalability Targets
- Support 10,000 total accounts (v1)
- Support 100,000,000 emails/month (across all accounts)
- Handle 1,000 concurrent queue jobs
- Database: MongoDB (document model suits subscriber/sequence data)
- Queue: Redis + BullMQ (proven, reliable, well-documented)

### Reliability Standards
- 99.5% uptime (acceptable for price point)
- Email queue resilience (jobs survive server restart)
- Graceful degradation (analytics can lag, sends cannot)
- Automatic retry logic (3 attempts with exponential backoff)

---

## SUCCESS METRICS (PRODUCT)

### Activation Metrics
- Time to first subscriber captured: <10 minutes
- Time to first broadcast sent: <15 minutes
- Time to first sequence created: <20 minutes

### Engagement Metrics
- Active users (sent email in last 30 days): >70%
- Sequences created per account: >2 (indicates understanding)
- Broadcasts sent per month per account: >2 (indicates regular use)

### Retention Metrics
- 30-day retention: >60%
- 90-day retention: >40%
- Churn rate: <5% monthly

### Business Metrics
- Average revenue per account: $25/month
- Customer acquisition cost: <$50
- Payback period: <2 months
- Lifetime value: >$600

---

## USER ONBOARDING FLOW

### First-Time Experience (Critical Path)

**Step 1: Account Creation (30 seconds)**
- Email + password signup (no phone number)
- Choose plan (Starter / Growth / Lifetime)
- Payment collection (Stripe Checkout)

**Step 2: Welcome Wizard (2 minutes)**
1. "What's your name?" → Personalizes interface
2. "What do you create?" → Newsletter / Course / Community / Products
3. "How big is your list?" → 0 / 1-500 / 500-2000 / 2000+ (sets expectations)

**Step 3: Quick Wins (5 minutes)**
- **Option A:** "Create a landing page" (fastest win)
  - Pick template
  - Write headline
  - Publish
  - Show shareable link
- **Option B:** "Import existing subscribers" (for switchers)
  - Upload CSV
  - Map fields
  - Import
  - Show subscriber count

**Step 4: First Automation (10 minutes)**
- "Create a welcome sequence"
- Pre-filled 3-email template (editable)
- Preview flow
- Activate sequence
- Assign to landing page

**Step 5: Invitation to Send First Broadcast**
- "Send your first email"
- Simple editor
- Send to all subscribers or just yourself (test)

**Onboarding Success:** User has captured first subscriber OR sent first email within 30 minutes

---

## MIGRATION SUPPORT (FROM COMPETITORS)

### Supported Import Sources
1. **Kit (ConvertKit)**
2. **MailerLite**
3. **SendFox**
4. Generic CSV (any provider)

### One-Click Import Features
- Upload subscriber export file
- Automatic field mapping (email, name, tags)
- Import sequences (converted to MEAP format)
- Import broadcasts (as drafts, not sent)
- Preserve unsubscribe status

### Migration Success Checklist
- ✅ All subscribers imported with tags
- ✅ Active sequences recreated (user reviews before activating)
- ✅ Unsubscribe list preserved
- ✅ Landing pages recreated (manual, template-based)
- ❌ Sent email history NOT imported (not possible, not necessary)
- ❌ Analytics NOT imported (clean slate acceptable)

**Design Principles:**
- Make switching painless (reduces friction, lowers CAC)
- Preserve subscriber data integrity (avoid duplicates, respect status)
- Offer migration support email (high-touch for first 100 customers)

---

## GO-TO-MARKET POSITIONING

### Messaging Framework

**Tagline:**  
"Email marketing that doesn't overthink it."

**Value Propositions:**
1. **Simplicity:** No visual builders. No complex automation. Just what you actually use.
2. **Affordability:** 50-75% cheaper than Kit, MailerLite, and ConvertKit.
3. **Effectiveness:** Plain-text emails get 21% more clicks. Personal beats polished.

**Positioning Statement:**  
"For solo creators who want the power of email automation without the complexity or cost of tools built for marketing teams."

### Target Channels
- Reddit: /r/Entrepreneur, /r/SideProject, /r/EmailMarketing
- Product Hunt launch (with lifetime deal)
- Twitter/X: Creator economy influencers
- LinkedIn: Freelancers and solopreneurs
- YouTube: Email marketing tutorial creators (sponsorships)

### Launch Strategy
1. **Private beta (first 50 users):** Lifetime deal at $29, heavy feedback loop
2. **Public launch (Product Hunt):** Lifetime deal at $49, comparison content vs. Kit
3. **Kit migration campaign:** "Switch from Kit and save $660/year" calculator
4. **Content marketing:** "How to run email marketing in 30 min/week" guides

---

## DESIGN PRINCIPLES (FOR DESIGN TEAM)

### 1. Speed Over Beauty
- Dashboard loads fast (use skeleton states, not spinners)
- Forms submit instantly (optimistic UI updates)
- Prioritize perceived performance

### 2. Clarity Over Cleverness
- Obvious labels, no jargon
- "Broadcasts" not "Campaigns"
- "Sequences" not "Automations" or "Workflows"

### 3. Defaults That Work
- Pre-filled sequence templates (3 emails, 2-day delays)
- Recommended send times for broadcasts
- Smart suggestions ("Most users send broadcasts on Tuesday 10am")

### 4. Minimal Chrome, Maximum Content
- No sidebar navigation (top nav + context-specific tabs)
- White space is a feature (reduces cognitive load)
- Mobile-first responsive (many creators work from phone)

### 5. Honest Feedback
- Don't hide errors behind "Something went wrong"
- Show remaining subscriber count vs. plan limit prominently
- Warn before hitting send caps ("You have 5,000 sends left today")

### 6. Trust Through Transparency
- Show email queue status ("23 emails sending now")
- Show deliverability stats (open rate benchmarks)
- Explain why features are limited ("We keep it simple so you can focus on writing")

---

## ROADMAP: V2 FEATURES (POST-LAUNCH)

**Not committing to these, but validated as valuable:**

### High Confidence
- Zapier integration (webhook triggers for external automation)
- Subscription billing via Stripe (recurring revenue for digital products)
- Custom sender domains (send from your@yourdomain.com)
- API access (read subscribers, send broadcasts programmatically)

### Medium Confidence
- Mobile app (iOS/Android for broadcast sending on-the-go)
- RSS-to-email (auto-send new blog posts)
- Referral program (subscribers refer friends, get reward)
- Template library (pre-written sequence copy for common use cases)

### Low Confidence (Would need more validation)
- SMS notifications (supplement email with text alerts)
- Podcast episode delivery (MP3 links in automated emails)
- Community/forum integration (Discourse, Circle, Discord)

---

## FINAL NOTES FOR OPUS 4.5

**Context for LLM:**  
This is a validated PRD based on real market research. Your job is to design the **feature set, user flows, and interaction patterns** for this platform.

**What we need from you:**
1. ✅ Feature prioritization (what to build first)
2. ✅ User flow diagrams (signup → first email sent)
3. ✅ Information architecture (how features relate)
4. ✅ Key interaction patterns (how sequences are created, how broadcasts are scheduled)
5. ✅ Edge case handling (what happens when... user has no subscribers, sequence is empty, etc.)

**What we do NOT need:**
- ❌ Database schemas
- ❌ API endpoint definitions
- ❌ Code implementation details
- ❌ Infrastructure architecture

**Design Constraints (Enforce These):**
- One sequence per subscriber (hard limit)
- Plain text emails only (no exceptions)
- Linear sequences only (no branching)
- UTC scheduling only (no per-subscriber timezones)
- Flat pricing (no usage-based billing)

**Quality Bar:**
If any design decision adds complexity not validated by user research, challenge it. Simplicity is the product's core value proposition.

**Expected Output:**
A complete product design specification covering:
- Feature breakdown (MVP vs. v2)
- User journeys (step-by-step flows)
- UI interaction patterns (how things work)
- Edge cases and error states
- Success metrics per feature

Ship a design that a frontend team can build from without needing to ask clarifying questions.

---

**End of PRD**
