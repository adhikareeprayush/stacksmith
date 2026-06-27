# Security Policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email **adhikareeprayush@gmail.com** with:

- A description of the issue
- Steps to reproduce
- Impact assessment (if known)
- Your GitHub username (optional), if you would like credit

You should receive a response within **5 business days**. If the report is accepted, we will coordinate a fix and disclosure timeline with you.

## Scope

In scope:

- The `stacksmith` CLI (`src/`)
- Bundled plugins (`plugins/`)
- Generated project templates and scaffolds (`src/scaffolds/`)

Out of scope:

- Vulnerabilities in dependencies of *generated* projects (report those upstream)
- Misconfigured self-hosted deployments of generated apps (weak secrets, exposed `.env`)

Thank you for helping keep Stacksmith safe.
