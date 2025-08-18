# Privacy & Data Policy (Template)

This application processes user-provided resume data to generate content and PDFs. By default, no data is persisted server-side unless you wire a database.

- Data Input: Text you paste/type into the editor and job descriptions.
- AI Processing: Inputs are sent to the configured AI provider from the server; consider your provider’s data retention policy.
- Logs: Server logs keep minimal request metadata for debugging (no sensitive payloads intentionally logged).
- Storage: The open-source version does not persist data by default. If you enable Supabase, data will be stored according to your configuration.
- Security: CORS allowlist, rate limiting, Helmet, and input validation are enabled on the server.

For production use, update this policy to reflect your deployment, region, data retention period, and contact information.
