# Supplementary knowledge for TE Chat

Drop owner-approved `.md` or `.txt` files in this folder to add them to TE
Chat's knowledge base, alongside the site's built-in service, FAQ, process
and contact data (see `lib/rag/knowledge.ts`).

Rules:

- Only put **approved, publishable** business information here (e.g. an
  approved FAQ addendum, a published policy). Never put customer records,
  credentials, financial data, or anything not meant for a public chatbot -
  it will be quoted back to website visitors.
- One file = one chunk. Start the file with a `# Title` line; it becomes the
  citation title.
- After adding, editing or removing a file, refresh the knowledge base from
  **Admin → TE Chat → Refresh knowledge base** (or redeploy - the index also
  rebuilds on a cold server start).
- PDF/DOCX are not parsed automatically in this version - convert to plain
  text or Markdown first. See `README.md` → "RAG architecture" for how to add
  a parser if you need one.

This folder is intentionally empty by default (no fabricated business facts
are added here). `README.md` itself is excluded from ingestion.
