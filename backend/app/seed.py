"""Seed the database with demo data.

Usage:
    python -m app.seed            # seeds only if DB is empty
    python -m app.seed --force    # wipes and re-seeds
"""
import sys
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.migrations import run_migrations
from app.models import Challenge, Event, EventRegistration, Submission, User
from app.services.auth_service import hash_password

DEMO_EVENTS = [
    {
        "name": "TerminalSix Open 2026",
        "flag_format": "T6{",
        "description": (
            "Our flagship jeopardy-style CTF. Categories include web, crypto, "
            "reverse, forensics and pwn. Beginners welcome — hints available "
            "on most challenges."
        ),
        "start_offset_hours": -1,
        "end_offset_hours": 47,
        "challenges": [
            ("Welcome to T6", "Join our Discord, find the flag in the #welcome channel pinned message.", "misc", "easy", 25, "T6{welcome_to_t6}", "The flag format is T6{...} and it is literally in the welcome text."),
            ("Cookie Monster", "The admin panel remembers you... a little too well. Manipulate your session cookie to become admin.", "web", "easy", 100, "T6{cookies_are_not_secure}", "Try editing the cookie value in your browser devtools."),
            ("RSA Primer", "We encrypted the flag with a tiny public exponent and no padding. Recover it.", "crypto", "easy", 150, "T6{e_equals_3}", "Small e means the ciphertext might be a perfect cube."),
            ("Broken Pipeline", "Our CI logs are public. Find the leaked credential and read the private note.", "web", "medium", 300, "T6{ci_logs_leak_secrets}", "Check the workflow run logs for environment dumps."),
            ("Strings Attached", "A memory dump from a compromised box. Find the attacker's exfiltration flag.", "forensics", "medium", 350, "T6{strings_in_memory}", "The strings utility is your friend; grep for 'T6{'."),
            ("Rotten Firmware", "Reverse this firmware image and recover the hardcoded update key.", "reverse", "hard", 500, "T6{firmware_never_sleeps}", "The update routine XORs a constant over the config blob."),
            ("Heap of Trouble", "Classic use-after-free in a custom allocator. Get the shell, read /flag.", "pwn", "insane", 750, "T6{heap_feng_shui_master}", "Tcache poisoning. Watch your chunk sizes."),
        ],
    },
    {
        "name": "NotDad — An OSINT Story",
        "flag_format": "dad{",
        "description": (
            "Dhyeya Anand Deshpande is a fictional rally driver with a digital "
            "footprint scattered across social platforms. Piece together his "
            "story — the small details matter, and not everything you find is "
            "signal. A live dockerised investigation is part of the event."
        ),
        "start_offset_hours": 0,
        "end_offset_hours": 72,
        "challenges": [
            ("The Birthday", "When was Dhyeya born? Flag is the date, lowercase, underscore-separated: dad{26_may_1974} is close enough in spirit — use the YYYY-MM-DD ordering without separators.", "osint", "easy", 50, "dad{26_05_1974}", "Check the earliest post that celebrates 'another lap around the sun'."),
            ("Home Turf", "Where is Dhyeya originally from? Flag is the town, lowercase, underscore-separated.", "osint", "easy", 50, "dad{satara}", "His origin is a small Maharashtra town famous for forts nearby."),
            ("The Machine", "Which motorcycle does Dhyeya adore and own? Flag is the model, lowercase, underscore-separated.", "osint", "medium", 100, "dad{royal_enfield_classic_500}", "A garage photo hides the tank badge."),
            ("Racing Line", "Which team does Dhyeya drive for? Flag is the acronym, lowercase.", "osint", "medium", 100, "dad{swrt}", "Look closely at the rally suit and the chess.com profile bio."),
            ("The Full Dossier", "The dockerised investigation is live at http://localhost:8080 — answer all ten questions about Dhyeya correctly and the service hands you the flag.", "osint", "hard", 500, "dad{0s1nt_1s_n0t_st4lk1ng}", "Start with the DOB; each correct field narrows the search.", "http://localhost:8080"),
        ],
    },
]


def seed(force: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        if not force and db.query(Event).count() > 0:
            print("Database already seeded. Use --force to re-seed.")
            return

        if force:
            db.query(Submission).delete()
            db.query(EventRegistration).delete()
            db.query(Challenge).delete()
            db.query(Event).delete()
            db.query(User).delete()
            db.commit()

        organiser = User(
            name="Demo Organiser",
            email="organiser@terminal6ix.dev",
            hashed_password=hash_password("organiser123"),
            role="organiser",
        )
        player = User(
            name="Demo Player",
            email="player@terminal6ix.dev",
            hashed_password=hash_password("player123"),
            role="participant",
        )
        db.add_all([organiser, player])
        db.commit()

        now = datetime.utcnow()
        for spec in DEMO_EVENTS:
            event = Event(
                name=spec["name"],
                description=spec["description"],
                start_time=now + timedelta(hours=spec["start_offset_hours"]),
                end_time=now + timedelta(hours=spec["end_offset_hours"]),
                flag_format=spec.get("flag_format"),
                created_by=organiser.id,
            )
            db.add(event)
            db.flush()
            for challenge in spec["challenges"]:
                title, desc, cat, diff, pts, flag, hint = challenge[:7]
                connection_url = challenge[7] if len(challenge) > 7 else None
                db.add(
                    Challenge(
                        event_id=event.id,
                        title=title,
                        description=desc,
                        category=cat,
                        difficulty=diff,
                        points=pts,
                        flag=flag,
                        flag_hint=hint,
                        connection_url=connection_url,
                    )
                )
            # Register the demo player so the leaderboard isn't empty
            db.add(EventRegistration(event_id=event.id, user_id=player.id))

        db.commit()
        print("Seeded:")
        print("  organiser@terminal6ix.dev / organiser123 (organiser)")
        print("  player@terminal6ix.dev / player123 (participant)")
        print(f"  {len(DEMO_EVENTS)} events with challenges")
    finally:
        db.close()


if __name__ == "__main__":
    seed(force="--force" in sys.argv)
