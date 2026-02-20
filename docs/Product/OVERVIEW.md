# Cofactor Scout - Product Overview

## What is Cofactor Scout?

Cofactor Scout is a platform that connects promising university research with venture capital investors. It operates through a two-tier community system where users can discover research opportunities, submit leads, and earn commission on successful matches.

## Core Value Proposition

**For Contributors & Scouts:**
- Discover cutting-edge research in your network
- Submit research leads to Cofactor's investment team
- Earn commission when matches are made
- Build your reputation as a talent scout

**For Researchers:**
- Get connected with relevant investors
- Accelerate funding opportunities
- Leverage scout networks for visibility

**For Investors:**
- Access curated, high-quality research leads
- Tap into university networks through scouts
- Reduce deal sourcing costs

## Two-Tier User System

### Contributors (Default Role)
**Who they are:**
- Anyone interested in discovering research opportunities
- Students, alumni, researchers, industry professionals
- No application or approval required

**What they can do:**
- ✓ Submit research leads immediately
- ✓ Track submission status
- ✓ Earn standard commission rates
- ✓ Apply to become a Scout later

**Badge:** Gray "Community Contributor" badge

### Scouts (Verified Role)
**Who they are:**
- Verified members of the Cofactor talent network
- Typically PhD students, postdocs, professors, or industry researchers
- Must apply and be approved

**What they can do:**
- ✓ All Contributor capabilities
- ✓ Priority review by Cofactor team
- ✓ Higher commission rates
- ✓ Green "Verified Scout" badge on submissions
- ✓ Part of official talent network

**Badge:** Green "Verified Scout" badge

**Requirements:**
- Application form submission
- University/institution affiliation
- Research area expertise
- Explanation of sourcing strategy
- Admin approval

## Key Features

### 1. Research Submission (3-Step Form)

**Step 1: Research Summary**
- Research topic and description
- Researcher name, email, institution
- Department information

**Step 2: Additional Details**
- Researcher career stage (undergrad, PhD, postdoc, professor, etc.)
- LinkedIn profile
- Research stage (early concept, active research, has results, published)
- Funding status (not seeking, seeking seed, grant-funded, etc.)
- Key publications
- Potential applications
- Supporting links
- Submission source (conference, paper, LinkedIn, personal connection, etc.)
- Relationship to researcher
- Researcher awareness (does researcher know about submission?)

**Step 3: Scout Pitch**
- Why is this research interesting?
- What makes it investment-worthy?

**Features:**
- Auto-save drafts
- Resume from any step
- Duplicate detection
- Email confirmation on submission

### 2. Dashboard

**Statistics Cards:**
- Total Submissions
- Pending Review
- Approved Submissions

**Submissions Table:**
- View all submitted research leads
- Filter by status
- See submission dates
- Track progress through pipeline

**Quick Actions:**
- Submit new research lead
- View drafts
- Apply to become Scout (if Contributor)

### 3. Scout Application

**Application Form:**
- Full name and email
- University and department
- LinkedIn profile (optional)
- Academic/professional role
- Research areas of expertise
- Why do you want to be a Scout?
- How will you source leads?

**Process:**
1. User submits application
2. Application status set to "Pending"
3. Admin reviews application
4. Admin approves or rejects
5. User notified via email
6. If approved, role upgraded to SCOUT

**Works for:**
- Logged-in users (updates existing account)
- Anonymous users (creates account + submits application)

### 4. User Settings

**Profile Settings:**
- Update display name
- Update bio
- Change profile picture (future)

**Account Settings:**
- Change password
- Email preferences (future)
- Privacy settings (future)

### 5. Email Notifications

**Automated Emails:**
- Welcome email (on sign-up)
- Email verification (required before sign-in)
- Password reset
- New sign-in notification
- Submission confirmation
- Scout application confirmation
- Scout approval notification
- Account updates

## Submission Pipeline

### Status Flow
```
PENDING_RESEARCH
  ↓
VALIDATING
  ↓
PITCHED_MATCHMAKING
  ↓
MATCH_MADE (Success!)
```

**Alternative:**
```
PENDING_RESEARCH → REJECTED
```

### Status Definitions

**PENDING_RESEARCH**
- Initial submission received
- Awaiting Cofactor team review
- Typical duration: 1-2 weeks

**VALIDATING**
- Under validation by Cofactor team
- Checking research quality, researcher interest, market fit
- Typical duration: 1-2 weeks

**PITCHED_MATCHMAKING**
- Pitched to relevant investors
- Matchmaking in progress
- Typical duration: 2-4 weeks

**MATCH_MADE**
- Successfully matched with investor
- Commission earned
- Success!

**REJECTED**
- Submission did not meet criteria
- Reasons: duplicate, not investment-ready, out of scope, etc.

## User Roles & Permissions

| Feature | Contributor | Scout | Admin |
|---------|-------------|-------|-------|
| Submit research leads | ✓ | ✓ | ✓ |
| View own submissions | ✓ | ✓ | ✓ |
| Save drafts | ✓ | ✓ | ✓ |
| Apply to be Scout | ✓ | - | - |
| Priority review | - | ✓ | ✓ |
| Higher commission | - | ✓ | ✓ |
| Green badge | - | ✓ | ✓ |
| Review scout applications | - | - | ✓ |
| Approve/reject scouts | - | - | ✓ |
| View all submissions | - | - | ✓ |
| Manage users | - | - | ✓ |

## Commission Structure

**Note:** Commission rates and payment details are managed by Cofactor team and not exposed in the platform.

**General Structure:**
- Contributors: Standard commission rate
- Scouts: Higher commission rate
- Commission paid on successful matches (MATCH_MADE status)

## Security & Privacy

### Account Security
- Email verification required
- Password complexity requirements
- Account lockout after 5 failed attempts
- Sign-in notifications
- Secure password reset

### Data Privacy
- User data encrypted in transit (HTTPS)
- Passwords hashed with bcrypt
- Email addresses not shared with third parties
- Researcher information only visible to Cofactor team

### Input Validation
- All inputs validated and sanitized
- XSS prevention
- SQL injection prevention
- Rate limiting (planned)

## Technical Requirements

### For Users
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Email address
- Internet connection

### For Researchers (Submitted Leads)
- University or research institution affiliation
- Active research project
- Email address for contact

## Roadmap

### MVP (Current)
- [x] User authentication (sign up, sign in, email verification)
- [x] Two-tier user system (Contributor, Scout)
- [x] Research submission (3-step form)
- [x] Draft saving
- [x] Dashboard with statistics
- [x] Scout application
- [x] Email notifications
- [x] User settings

### Post-MVP
- [ ] Admin dashboard
- [ ] Scout application review interface
- [ ] Submission review workflow
- [ ] Commission tracking
- [ ] Payment integration
- [ ] Advanced search and filtering
- [ ] Submission comments/feedback
- [ ] Researcher profiles
- [ ] Institution pages
- [ ] Analytics dashboard
- [ ] Mobile app

## Success Metrics

### User Engagement
- Number of active Contributors
- Number of active Scouts
- Submissions per user
- Scout application rate
- Scout approval rate

### Submission Quality
- Submissions per month
- Approval rate (not rejected)
- Match rate (MATCH_MADE)
- Time to match

### Platform Health
- User retention rate
- Scout retention rate
- Average submissions per Scout
- Duplicate submission rate

## Support

### For Users
- In-app support widget (future)
- Email: support@cofactor.world
- FAQ page (future)

### For Researchers
- Contact Cofactor team directly
- Email: research@cofactor.world

### For Investors
- Contact Cofactor team directly
- Email: investors@cofactor.world

## Glossary

**Contributor**: Default user role, can submit research leads immediately

**Scout**: Verified user role with priority review and higher commission

**Research Lead**: A submission of promising research to Cofactor

**Draft**: Saved but not submitted research lead

**Submission**: Research lead submitted for review

**Match**: Successful connection between researcher and investor

**Commission**: Payment earned when a match is made

**Pipeline**: The stages a submission goes through (Pending → Validating → Pitched → Matched)

**Scout Application**: Form to apply for Scout status

**Verification Email**: Email sent to verify user's email address

**Account Lockout**: Temporary account lock after failed login attempts
