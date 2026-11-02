# Save the Date

A static, serverless save-the-date page for Sam & Lindsay (12 June 2027), hosted on GitHub Pages. Guests open an envelope, the card slides out, and they can add the date to their calendar or look up the venue.

## Files

- `index.html`, `style.css`, `app.js`: the page. Event details live at the top of `app.js`.
- `save-the-date.ics`: the Apple/Outlook calendar file (keep its CRLF line endings).
- `assets/invite.webp` / `invite.jpg`: the card, resized from the 1429x2000 original.
- `assets/og-image.jpg`: the 1200x630 picture shown in iMessage/WhatsApp link previews.

## Personal links

Add `#to=Name` to the link to write a name on the envelope, e.g. `https://example.com/#to=Aunt%20Mary`.

## Custom domain

1. Put the domain (e.g. `www.example.com`) in a file named `CNAME` at the repo root.
2. At the domain's DNS provider: for `www`, a CNAME record to `samdelaney.github.io`; for the bare domain, A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
3. In the repo's Settings > Pages, tick "Enforce HTTPS" once the certificate is issued.
4. Update the `og:url` and `og:image` URLs in `index.html` to the new domain, or link previews keep pointing at github.io.

## Local preview

```bash
python -m http.server 8137
```
