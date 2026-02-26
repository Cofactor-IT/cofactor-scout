import * as Sentry from "@sentry/nextjs";

// Check cookie synchronously before init
const hasConsent = typeof document !== 'undefined' && document.cookie.includes('"error":true');

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: hasConsent, // Sentry SDK only enables if consent is given
    tracesSampleRate: 1.0,

    // You can still configure beforeSend here to sanitize if necessary
    beforeSend(event, hint) {
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.filter(bc => {
                return !bc.message?.toLowerCase().includes('password')
            })
        }
        return event
    }
});
