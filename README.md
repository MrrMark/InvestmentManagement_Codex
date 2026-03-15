# InvestmentManagement_Codex

## Docker validation

1. Build the image.
   `docker compose build`
2. Start the app with Prisma migrate, seed, and Next.js production server.
   `docker compose up -d`
   If port `3000` is already in use, run `HOST_PORT=3001 docker compose up -d`.
3. Smoke test the main pages.
   `curl http://localhost:3000/`
   `curl http://localhost:3000/snapshots`
   `curl http://localhost:3000/import`
4. Stop the stack.
   `docker compose down`
5. Reset the SQLite volume when needed.
   `docker compose down -v`
