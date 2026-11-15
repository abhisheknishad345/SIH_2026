# Contributing to TechConnect

Thank you for considering contributing to TechConnect!

## Before You Start

1. Check the existing issues and pull requests to avoid duplicate work.
2. For a major change, open an issue first to discuss the proposal.
3. Keep changes focused and consistent with the current project structure.

## Development Setup

Follow the setup instructions in [README.md](README.md). Install backend and frontend dependencies separately:

```bash
cd Backend && npm install
cd ../frontend && npm install
```

Configure local environment variables using `Backend/.env.example` and the frontend `VITE_DEV_URL` variable. Never commit secrets.

## Branching

Create a descriptive branch from `main`:

```bash
git checkout -b feat/short-feature-name
```

Suggested prefixes:
- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation
- `refactor/` — code improvement without intended behaviour change
- `chore/` — maintenance

## Code Guidelines

- Follow the existing JavaScript and React conventions.
- Keep controllers, services, models, routes, and validators in their existing layers.
- Validate request data on the backend; do not rely only on frontend validation.
- Preserve role-based authorization and ownership checks.
- Do not expose secrets, tokens, or personal data in logs or responses.
- Update API documentation when an endpoint or request/response contract changes.
- Keep pull requests small and explain the reason for the change.

## Before Opening a Pull Request

Run the checks relevant to your changes:

**Frontend**
```bash
cd frontend
npm run lint
npm run build
```

**Backend**
```bash
cd Backend
npm run dev
```

The backend package currently does not define an automated test suite. Include manual testing steps in your pull request when automated tests are unavailable.

## Pull Request Checklist

- [ ] The change has a clear description and motivation.
- [ ] Existing functionality has not been unintentionally broken.
- [ ] Input validation and authorization have been considered.
- [ ] Documentation has been updated where needed.
- [ ] No secrets, generated build files, or dependency folders are included.
- [ ] Relevant lint/build/manual checks have been completed.

By participating, you agree to follow the project's [Code of Conduct](CODE_OF_CONDUCT.md).
