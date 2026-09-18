from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


def unique_email() -> str:
    return f"{uuid4().hex[:10]}@test.dev"


def register_user(client, role="participant", name=None):
    payload = {
        "name": name or f"User {uuid4().hex[:6]}",
        "email": unique_email(),
        "password": "secret123",
        "role": role,
    }
    res = client.post("/auth/signup", json=payload)
    assert res.status_code == 200, res.text
    login = client.post(
        "/auth/login", json={"email": payload["email"], "password": "secret123"}
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {"token": token, "headers": {"Authorization": f"Bearer {token}"}, **payload}


@pytest.fixture()
def organiser(client):
    return register_user(client, role="organiser")


@pytest.fixture()
def participant(client):
    return register_user(client, role="participant")


@pytest.fixture()
def event(client, organiser):
    now = datetime.utcnow()
    res = client.post(
        "/events/",
        json={
            "name": "Test CTF",
            "description": "A test event",
            "start_time": (now - timedelta(minutes=5)).isoformat(),
            "end_time": (now + timedelta(hours=2)).isoformat(),
        },
        headers=organiser["headers"],
    )
    assert res.status_code == 201, res.text
    return res.json()


@pytest.fixture()
def challenges(client, organiser, event):
    specs = [
        {
            "title": "SQLi Basics",
            "description": "Dump the users table.",
            "category": "web",
            "difficulty": "easy",
            "points": 100,
            "flag": "flag{sqli_basic}",
        },
        {
            "title": "RSA Warmup",
            "description": "Small e, small n.",
            "category": "crypto",
            "difficulty": "medium",
            "points": 250,
            "flag": "flag{rsa_warmup}",
        },
    ]
    created = []
    for spec in specs:
        res = client.post(
            f"/events/{event['id']}/challenges", json=spec, headers=organiser["headers"]
        )
        assert res.status_code == 201, res.text
        created.append(res.json())
    return created


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


def test_signup_login_me(client):
    u = register_user(client)
    me = client.get("/auth/me", headers=u["headers"])
    assert me.status_code == 200
    assert me.json()["email"] == u["email"]
    assert me.json()["role"] == "participant"


def test_duplicate_signup_fails(client):
    payload = {
        "name": "Dup",
        "email": unique_email(),
        "password": "secret123",
        "role": "participant",
    }
    assert client.post("/auth/signup", json=payload).status_code == 200
    assert client.post("/auth/signup", json=payload).status_code == 400


def test_login_wrong_password(client):
    payload = {
        "name": "X",
        "email": unique_email(),
        "password": "secret123",
        "role": "participant",
    }
    client.post("/auth/signup", json=payload)
    res = client.post(
        "/auth/login", json={"email": payload["email"], "password": "wrong"}
    )
    assert res.status_code == 401


def test_me_requires_token(client):
    assert client.get("/auth/me").status_code == 401


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------


def test_create_event_requires_organiser(client, participant):
    now = datetime.utcnow()
    res = client.post(
        "/events/",
        json={
            "name": "Nope",
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(hours=1)).isoformat(),
        },
        headers=participant["headers"],
    )
    assert res.status_code == 403


def test_event_validation_end_before_start(client, organiser):
    now = datetime.utcnow()
    res = client.post(
        "/events/",
        json={
            "name": "Bad",
            "start_time": now.isoformat(),
            "end_time": (now - timedelta(hours=1)).isoformat(),
        },
        headers=organiser["headers"],
    )
    assert res.status_code == 422


def test_event_detail_has_counters(client, organiser, participant, event, challenges):
    client.post(
        f"/events/{event['id']}/register", headers=participant["headers"]
    )
    detail = client.get(f"/events/{event['id']}", headers=participant["headers"])
    assert detail.status_code == 200
    body = detail.json()
    assert body["challenge_count"] == 2
    assert body["total_points"] == 350
    assert body["participant_count"] == 1
    assert body["is_registered"] is True
    assert body["is_ongoing"] is True


def test_update_and_delete_event_ownership(client, organiser, participant):
    now = datetime.utcnow()
    res = client.post(
        "/events/",
        json={
            "name": "Mine",
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(hours=1)).isoformat(),
        },
        headers=organiser["headers"],
    )
    event_id = res.json()["id"]

    # Other organiser cannot modify
    other = register_user(client, role="organiser")
    assert (
        client.put(
            f"/events/{event_id}",
            json={"name": "Hacked"},
            headers=other["headers"],
        ).status_code
        == 403
    )

    assert (
        client.put(
            f"/events/{event_id}", json={"name": "Renamed"}, headers=organiser["headers"]
        ).status_code
        == 200
    )
    assert (
        client.delete(f"/events/{event_id}", headers=organiser["headers"]).status_code
        == 204
    )


def test_my_events(client, participant, event):
    assert client.get("/events/me", headers=participant["headers"]).json() == []
    client.post(f"/events/{event['id']}/register", headers=participant["headers"])
    mine = client.get("/events/me", headers=participant["headers"])
    assert len(mine.json()) == 1
    assert mine.json()[0]["id"] == event["id"]


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


def test_register_and_unregister(client, participant, event):
    res = client.post(f"/events/{event['id']}/register", headers=participant["headers"])
    assert res.status_code == 201
    # Duplicate registration blocked
    assert (
        client.post(
            f"/events/{event['id']}/register", headers=participant["headers"]
        ).status_code
        == 409
    )
    assert (
        client.delete(
            f"/events/{event['id']}/register", headers=participant["headers"]
        ).status_code
        == 204
    )
    # Now unregistered, delete again 404s
    assert (
        client.delete(
            f"/events/{event['id']}/register", headers=participant["headers"]
        ).status_code
        == 404
    )


def test_register_unknown_event(client, participant):
    res = client.post(f"/events/{uuid4()}/register", headers=participant["headers"])
    assert res.status_code == 404


# ---------------------------------------------------------------------------
# Challenges
# ---------------------------------------------------------------------------


def test_create_challenge_requires_owner(client, organiser, event):
    other = register_user(client, role="organiser")
    res = client.post(
        f"/events/{event['id']}/challenges",
        json={
            "title": "Steal",
            "description": "x",
            "points": 10,
            "flag": "flag{x}",
        },
        headers=other["headers"],
    )
    assert res.status_code == 403


def test_duplicate_challenge_title(client, organiser, event, challenges):
    res = client.post(
        f"/events/{event['id']}/challenges",
        json={
            "title": "SQLi Basics",
            "description": "x",
            "points": 10,
            "flag": "flag{y}",
        },
        headers=organiser["headers"],
    )
    assert res.status_code == 409


def test_challenge_list_never_exposes_flag(client, participant, event, challenges):
    res = client.get(
        f"/events/{event['id']}/challenges", headers=participant["headers"]
    )
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    for item in items:
        assert "flag" not in item


def test_challenge_filters(client, participant, event, challenges):
    res = client.get(
        f"/events/{event['id']}/challenges?category=crypto",
        headers=participant["headers"],
    )
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "RSA Warmup"

    res = client.get(
        f"/events/{event['id']}/challenges?difficulty=easy",
        headers=participant["headers"],
    )
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "SQLi Basics"


def test_challenge_requires_registration_ongoing(client, event, challenges):
    outsider = register_user(client)
    res = client.get(
        f"/events/{event['id']}/challenges/{challenges[0]['id']}",
        headers=outsider["headers"],
    )
    assert res.status_code == 403


def test_organiser_admin_view_includes_flag(client, organiser, event, challenges):
    res = client.get(
        f"/events/{event['id']}/challenges/all", headers=organiser["headers"]
    )
    assert res.status_code == 200
    assert all("flag" in c for c in res.json())


# ---------------------------------------------------------------------------
# Submissions & scoring
# ---------------------------------------------------------------------------


def test_submit_flow(client, participant, event, challenges):
    ch = challenges[0]
    client.post(f"/events/{event['id']}/register", headers=participant["headers"])

    # Wrong flag
    wrong = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "flag{wrong}"},
        headers=participant["headers"],
    )
    assert wrong.status_code == 201
    assert wrong.json()["is_correct"] is False
    assert wrong.json()["points_awarded"] == 0

    # Right flag
    right = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "flag{sqli_basic}"},
        headers=participant["headers"],
    )
    assert right.status_code == 201
    assert right.json()["is_correct"] is True
    assert right.json()["points_awarded"] == 100

    # Duplicate solve blocked
    again = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "flag{sqli_basic}"},
        headers=participant["headers"],
    )
    assert again.status_code == 409


def test_submit_without_registration_blocked(client, participant, challenges):
    ch = challenges[0]
    res = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "flag{sqli_basic}"},
        headers=participant["headers"],
    )
    assert res.status_code == 403


def test_leaderboard_dynamic(client, organiser, participant, event, challenges):
    client.post(f"/events/{event['id']}/register", headers=participant["headers"])
    # Solve both challenges
    for ch, flag in zip(
        challenges, ["flag{sqli_basic}", "flag{rsa_warmup}"]
    ):
        res = client.post(
            f"/challenges/{ch['id']}/submit",
            json={"flag": flag},
            headers=participant["headers"],
        )
        assert res.json()["is_correct"] is True

    board = client.get(
        f"/events/{event['id']}/leaderboard", headers=organiser["headers"]
    )
    assert board.status_code == 200
    entries = board.json()
    assert len(entries) == 1
    top = entries[0]
    assert top["rank"] == 1
    assert top["score"] == 350
    assert top["solved_count"] == 2


def test_leaderboard_tiebreak(client, event, challenges):
    a = register_user(client)
    b = register_user(client)
    for u in (a, b):
        client.post(f"/events/{event['id']}/register", headers=u["headers"])
        client.post(
            f"/challenges/{challenges[0]['id']}/submit",
            json={"flag": "flag{sqli_basic}"},
            headers=u["headers"],
        )
    board = client.get(
        f"/events/{event['id']}/leaderboard", headers=a["headers"]
    ).json()
    assert [e["rank"] for e in board] == [1, 2]
    assert board[0]["score"] == board[1]["score"] == 100


# ---------------------------------------------------------------------------
# Flag format per event
# ---------------------------------------------------------------------------


def test_flag_format_enforced(client, organiser):
    now = datetime.utcnow()
    res = client.post(
        "/events/",
        json={
            "name": "Format CTF",
            "start_time": (now - timedelta(minutes=5)).isoformat(),
            "end_time": (now + timedelta(hours=2)).isoformat(),
            "flag_format": "dad{",
        },
        headers=organiser["headers"],
    )
    assert res.status_code == 201
    event = res.json()
    assert event["flag_format"] == "dad{"

    ch = client.post(
        f"/events/{event['id']}/challenges",
        json={
            "title": "Quiz",
            "description": "Solve the quiz.",
            "category": "osint",
            "points": 200,
            "flag": "dad{correct_answer}",
        },
        headers=organiser["headers"],
    ).json()

    player = register_user(client)
    client.post(f"/events/{event['id']}/register", headers=player["headers"])

    # Wrong prefix rejected with a helpful message
    bad = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "flag{correct_answer}"},
        headers=player["headers"],
    )
    assert bad.status_code == 400
    assert "dad{" in bad.json()["detail"]

    # Correct prefix accepted (even if the answer itself is wrong)
    wrong = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "dad{wrong_answer}"},
        headers=player["headers"],
    )
    assert wrong.status_code == 201
    assert wrong.json()["is_correct"] is False

    # Fully correct flag scores
    right = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "dad{correct_answer}"},
        headers=player["headers"],
    )
    assert right.status_code == 201
    assert right.json()["is_correct"] is True


def test_event_without_flag_format_accepts_any_prefix(client, organiser, participant, event):
    ch = client.post(
        f"/events/{event['id']}/challenges",
        json={
            "title": "Free form",
            "description": "Any prefix goes.",
            "points": 50,
            "flag": "wh4t3v3r{prefix-free}",
        },
        headers=organiser["headers"],
    ).json()
    client.post(f"/events/{event['id']}/register", headers=participant["headers"])
    res = client.post(
        f"/challenges/{ch['id']}/submit",
        json={"flag": "wh4t3v3r{prefix-free}"},
        headers=participant["headers"],
    )
    assert res.status_code == 201
    assert res.json()["is_correct"] is True
