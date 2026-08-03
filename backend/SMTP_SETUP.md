SMTP setup and testing
======================

1) Choose a provider
- Recommended: SendGrid, Mailgun, Mailjet, or your SMTP relay.
- Gmail/Google Workspace works but can require OAuth or app passwords.

2) Populate `backend/.env` (copy from `.env.example`)
Example (SendGrid SMTP relay):

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=REPLACE_WITH_SENDGRID_API_KEY
FROM_EMAIL=no-reply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

3) Restart backend

PowerShell:
```
npm --prefix .\backend install
npm --prefix .\backend start
```

4) Test by posting a contact (the app posts automatically on contact submit)

PowerShell test POST:
```
Invoke-RestMethod -Uri 'http://localhost:4000/api/contacts' -Method Post -ContentType 'application/json' -Body (@{name='Test';email='you@example.com';subject='SMTP test';message='Test';urgency='normal'} | ConvertTo-Json)
```

5) Verify delivery
- If using Ethereal (dev fallback) the API response includes `emailResult.client.previewUrl` and `emailResult.admin.previewUrl` you can open in a browser.
- For a real SMTP provider, check the recipient inbox (or the provider's activity logs).

6) View sent emails in the app
- The backend provides an admin route `/api/sent-emails` (requires auth). To get a token:
```
Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"email":"admin@diversia.local","password":"ChangeMe123!"}'
```
Use the returned token in the `Authorization: Bearer <token>` header to call `/api/sent-emails`.

Notes
- Use secure credentials and avoid committing `.env` to source control.
- If you prefer, I can wire a specific provider (example: SendGrid) and add a small script to send a verification email automatically.
