# SlabMarket

PSA Pokémon TCG slab aggregator and marketplace. Aggregates listings from eBay, PWCC, Cardmarket and native listings into a single dense, data-heavy interface.

## Quick Start

```bash
docker-compose up
```

This starts PostgreSQL, Redis, and the Next.js app. On first run it installs dependencies, pushes the Prisma schema, and seeds the database with 10 cards and ~60 listings.

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **PostgreSQL** + Prisma ORM
- **Redis** (for future job queue)
- **Docker Compose** for local dev

## Cards Included

1. Mew Ex #232 — Paldean Fates
2. Mega Charizard X Ex #125 — Phantasmal Flames
3. Team Rocket's Mewtwo Ex #231 — Destined Rivals
4. Charizard #4 — Base Set (1st Edition)
5. Blastoise #2 — Base Set
6. Lugia #9 — Neo Genesis (1st Edition)
7. Pikachu #58 — Base Set (Shadowless)
8. Mewtwo #10 — Base Set
9. Dark Charizard #4 — Team Rocket (1st Edition)
10. Venusaur #15 — Base Set

## API Endpoints

- `GET /api/cards` — List cards (sort, search, pagination)
- `GET /api/cards/:slug` — Card detail with listings, offers, price history
- `GET /api/listings` — Search listings across platforms
- `POST /api/orders` — Create an order (Stripe stubbed)
- `GET/POST /api/native-listings` — Manage native SlabMarket listings

## Without Docker

```bash
npm install
# Set DATABASE_URL in .env to your local Postgres
npx prisma db push
npx prisma db seed
npm run dev
```
