# LUNISI Services Website

Responsive static marketing website built with HTML, CSS, and JavaScript.

## Pages
- `index.html` — Home
- `services.html` — Services and pricing
- `about.html` — About
- `before-after.html` — Project gallery placeholder
- `service-areas.html` — Service area information
- `quote.html` — Quote request form
- `privacy-policy.html` — Privacy policy draft

## Run locally
Open `index.html` in a browser, or use a local static server (recommended):
`python -m http.server 8080`
Then open `http://localhost:8080`.

## Before publishing — required
1. Replace `https://www.example.com` in canonical URLs, Open Graph URL, `robots.txt`, and `sitemap.xml` with the real domain.
2. Replace `hello@example.com` and add verified business phone/email/contact details.
3. Verify all imagery, licenses, and final image choices.
4. Confirm the business's actual service areas; do not advertise unconfirmed locations.
5. Review and customize `privacy-policy.html`.
6. Configure the quote form backend. The included Netlify Function intentionally returns a setup-required response and does not yet send messages or retain uploaded photos.
7. Implement secure multipart form parsing and private photo storage. Configure Resend and Twilio credentials as Netlify environment variables, never in frontend code.
8. Test form delivery, SMS consent language, file limits, spam protection, accessibility, links, metadata, mobile breakpoints, and Core Web Vitals before launch.
9. Add a real favicon and social sharing image before launch.

## Netlify deployment
Deploy the folder as a Netlify site. For the function, install dependencies and configure the server-side handler before accepting real customer data. A static deploy can display the site, but the quote form will not submit successfully until the backend is implemented and credentials are configured.

## SEO
This is a starter implementation. Domain values, business facts, structured data, and service areas must be verified before indexing. SEO rankings are not guaranteed.
