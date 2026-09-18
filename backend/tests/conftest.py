import os

# Ensure tests run against an isolated database unless explicitly overridden.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/terminal6ix_test",
)
os.environ.setdefault("SECRET_KEY", "testsecret")
