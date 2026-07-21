-- Hanzo Base schema for Curriculum (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped — the collection access rule is `@request.auth.org_id = org`, so a
-- member of your org reads/writes your resume and other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/views/resume.tsx renders it, src/views/editor.tsx edits it).

-- Who the resume is for: the single header block. The app treats the newest
-- `profile` row as the live one (the editor upserts it), so there is one resume
-- per org.
CREATE TABLE IF NOT EXISTS profile (
  name    TEXT NOT NULL,   -- full name, the resume headline
  title   TEXT NOT NULL,   -- professional title / role line
  summary TEXT NOT NULL    -- the opening summary paragraph
);

-- Every line item on the resume, grouped by `section` (Experience, Projects,
-- Skills, Education, …). `when` is free text ("2021 – Present", "2019") so it
-- reads exactly as written; ordering within a section follows insertion.
CREATE TABLE IF NOT EXISTS entries (
  section TEXT NOT NULL,   -- which block it belongs to
  title   TEXT NOT NULL,   -- role, project or credential
  detail  TEXT NOT NULL,   -- the supporting description
  "when"  TEXT NOT NULL    -- the date or range, verbatim (quoted: reserved word)
);
