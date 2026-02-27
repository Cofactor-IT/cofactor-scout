# Cookie Consent - Primer

**Audience:** Non-technical, Product Managers  
**Last Updated:** 2024-12-19

## What is Cookie Consent?

A GDPR-compliant system that gives users control over which cookies they allow on the platform. Users can accept or reject analytics and error monitoring cookies.

## Why We Built This

### Legal Compliance
- **GDPR Requirement:** EU law requires explicit consent before setting non-essential cookies
- **User Privacy:** Users have the right to control their data
- **Audit Trail:** We must log all consent decisions for compliance

### User Trust
- Transparent about data collection
- Gives users control over their privacy
- Shows we respect user preferences

## How It Works

### First Visit
1. User lands on any page
2. Banner appears at bottom of screen
3. Three options:
   - **Accept All** → Enables all cookies, banner disappears
   - **Reject All** → Disables non-essential cookies, banner disappears
   - **Customize** → Opens modal with granular controls

### Customization Modal
- **Analytics Cookies** toggle (Vercel Analytics)
- **Error Monitoring** toggle (Sentry)
- **Strictly Necessary** always enabled (authentication, security)
- "Save Preferences" button commits choices

### Returning Users
- Banner doesn't show if consent already given
- "Cookie Settings" link in footer to update choices
- Settings page has "Manage Cookie Preferences" button

## Cookie Categories

### Strictly Necessary (Always On)
- **Purpose:** Authentication, security, basic functionality
- **Examples:** Session cookies, CSRF tokens
- **Default:** Always enabled (no consent needed)

### Analytics Cookies (Vercel Analytics)
- **Purpose:** Track page views and user behavior
- **Data Collected:** Pages visited, time on site, referrer
- **Provider:** Vercel
- **Default:** OFF (requires consent)

### Error Monitoring (Sentry)
- **Purpose:** Detect and fix bugs
- **Data Collected:** Error messages, stack traces, browser info
- **Provider:** Sentry
- **Default:** OFF (requires consent)

## Where Users See This

### 1. First Visit Banner
- **Location:** Bottom of screen, fixed position
- **Trigger:** No consent cookie exists
- **Dismissal:** Automatically hides after choice

### 2. Footer Link
- **Location:** Footer on all pages
- **Text:** "Cookie Settings"
- **Action:** Opens modal with current preferences

### 3. Settings Page
- **Location:** `/settings` → Privacy & Cookies section
- **Button:** "Manage Cookie Preferences"
- **Action:** Opens modal with current preferences

## Data Storage

### Cookie
- **Name:** `cf_consent`
- **Expiration:** 182 days (6 months)
- **Contents:** User's choices (analytics: true/false, error: true/false)
- **Security:** SameSite=Strict, path=/

### Database
- **Table:** `ConsentRecord`
- **Stored:** User ID, choices, timestamp, IP address, user agent
- **Purpose:** Compliance audit trail
- **Retention:** Indefinite (legal requirement)

## Common Questions

**Q: Why do we need this?**  
A: GDPR requires explicit consent for non-essential cookies. Fines for non-compliance can be up to €20 million.

**Q: Can users still use the platform if they reject all cookies?**  
A: Yes! Essential cookies (authentication, security) don't require consent and always work.

**Q: What happens if a user doesn't make a choice?**  
A: Banner stays visible until they decide. No non-essential cookies are set.

**Q: Can users change their mind later?**  
A: Yes, via footer link or settings page.

**Q: Do we track users who opt out?**  
A: No. If they disable analytics, we don't track them. If they disable error monitoring, we don't log their errors.

**Q: What about users outside the EU?**  
A: We show the banner to everyone for consistency and best practices.
