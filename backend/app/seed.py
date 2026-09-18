"""Seed the database with demo data.

Usage:
    python -m app.seed            # seeds only if DB is empty
    python -m app.seed --force    # wipes and re-seeds
"""
import sys
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import Challenge, Event, EventRegistration, Submission, User
from app.services.auth_service import hash_password

DEMO_EVENTS = [
    {
        "name": "TerminalSix Open 2026",
        "description": (
            "Our flagship jeopardy-style CTF. Categories include web, crypto, "
            "reverse, forensics and pwn. Beginners welcome — hints available "
            "on most challenges."
        ),
        "start_offset_hours": -1,
        "end_offset_hours": 47,
        "challenges": [
            ("Welcome to T6", "Join our Discord, find the flag in the #welcome channel pinned message.", "misc", "easy", 25, "flag{welcome_to_t6}", "The flag format is flag{...} and it is literally in the welcome text."),
            ("Cookie Monster", "The admin panel remembers you... a little too well. Manipulate your session cookie to become admin.", "web", "easy", 100, "flag{cookies_are_not_secure}", "Try editing the cookie value in your browser devtools."),
            ("RSA Primer", "We encrypted the flag with a tiny public exponent and no padding. Recover it.", "crypto", "easy", 150, "flag{e_equals_3}", "Small e means the ciphertext might be a perfect cube."),
            ("Broken Pipeline", "Our CI logs are public. Find the leaked credential and read the private note.", "web", "medium", 300, "flag{ci_logs_leak_secrets}", "Check the workflow run logs for environment dumps."),
            ("Strings Attached", "A memory dump from a compromised box. Find the attacker's exfiltration flag.", "forensics", "medium", 350, "flag{strings_in_memory}", "The strings utility is your friend; grep for 'flag{'."),
            ("Rotten Firmware", "Reverse this firmware image and recover the hardcoded update key.", "reverse", "hard", 500, "flag{firmware_never_sleeps}", "The update routine XORs a constant over the config blob."),
            ("Heap of Trouble", "Classic use-after-free in a custom allocator. Get the shell, read /flag.", "pwn", "insane", 750, "flag{heap_feng_shui_master}", "Tcache poisoning. Watch your chunk sizes."),
        ],
    },
    {
        "name": "Cyber Zombies Bootcamp",
        "description": (
            "A 6-hour beginner-friendly bootcamp. Learn the basics of web "
            "exploitation, OSINT and cryptography while competing for fun prizes."
        ),
        "start_offset_hours": 24,
        "end_offset_hours": 30,
        "challenges": [
            ("Hello OSINT", "Find the city in this photo's metadata. Flag is the city name in lowercase.", "osint", "easy", 50, "flag{prague}", "EXIF data survives most social media re-uploads... but not this one."),
            ("Basecamp", "This text looks like gibberish: ZmxhZ3tiYXNlNjRfaXNfZWFzeX0=", "misc", "easy", 25, "flag{base64_is_easy}", "That equals sign at the end is a giveaway."),
            ("Login Bypass 101", "' OR 1=1 -- ...you know what to do.", "web", "easy", 100, "flag{classic_sqli}", "It really is the classic. No WAF here."),
        ],
    },
]


def seed(force: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
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
                created_by=organiser.id,
            )
            db.add(event)
            db.flush()
            for title, desc, cat, diff, pts, flag, hint in spec["challenges"]:
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
