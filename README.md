Project initialization

## Docker Compose

Copy `.env.example` to `.env` before starting the stack. `DB_PORT` is for
processes running on the host machine; Docker Compose gives the API container
`DB_HOST=db` and `DB_PORT=5432` directly. Use `DB_HOST_PORT` only when you want
to expose Postgres on a different port on your host machine.

Start the local development stack with:

```sh
docker compose up --build
```

The Postgres service mounts `apps/api/db/schema.sql` into
`/docker-entrypoint-initdb.d`, so Docker runs the schema automatically the
first time the `apps_db_data` volume is created. This is the cleanest local
development path because `docker compose up` gives a ready database without
coupling schema creation to API startup.

If the database volume already exists and the schema changes, apply the schema
explicitly:

```sh
docker compose run --rm api npm run db:schema
```

Use that same explicit schema command as the production/release step against
the production database. Production databases usually keep their data volumes
between deploys, so relying on the Postgres image's first-run init hook would
silently skip later schema changes.
