# Security Policy

## Supported Versions

Security fixes are intended for the latest code on the `main` branch. Older snapshots may not receive security updates.

## Reporting a Vulnerability

Please do not publish exploitable vulnerability details in a public issue.

Instead, use GitHub's private vulnerability reporting feature for this repository, if enabled. If it is unavailable, contact the repository maintainer privately through GitHub and include:

- A clear description of the vulnerability.
- Steps to reproduce it.
- The potential impact.
- Any suggested mitigation, if known.

Please allow maintainers reasonable time to investigate and prepare a fix before publicly disclosing the issue.

## Security Best Practices for Contributors

- Never commit credentials, tokens, private keys, or production environment files.
- Do not include real user data in screenshots, logs, or test fixtures.
- Validate and authorize requests on the backend.
- Avoid logging passwords, OTPs, session tokens, or sensitive personal information.
