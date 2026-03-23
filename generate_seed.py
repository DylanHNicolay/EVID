#!/usr/bin/env python3
"""
Generates SEED.sql with ~4,500+ rows of realistic sample data for divecloud.
Run: python generate_seed.py > SEED.sql
"""

import random
import sys
from datetime import date, timedelta

random.seed(42)

# Bcrypt hash of 'password'
PASSWORD_HASH = "$2b$12$LJ3m4ys3Lk0TSwMCkVc3JOSKaAHrYQL0lBTzSn6X9.Cv4fFvdJCaO"

# ─────────────────────────────────────────────────────────────────────
# DATA POOLS
# ─────────────────────────────────────────────────────────────────────

TEAMS = [
    {
        "name": "University of Virginia",
        "abbreviation": "UVA",
        "school": "Virginia",
        "division": "Division I",
        "conference": "ACC",
        "location": "Charlottesville, VA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Virginia_Cavaliers_logo.svg/200px-Virginia_Cavaliers_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=1200",
        "accent_color": "#232D4B",
    },
    {
        "name": "Stanford University",
        "abbreviation": "STAN",
        "school": "Stanford",
        "division": "Division I",
        "conference": "Pac-12",
        "location": "Stanford, CA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/200px-Stanford_Cardinal_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200",
        "accent_color": "#8C1515",
    },
    {
        "name": "University of Texas",
        "abbreviation": "TEX",
        "school": "Texas",
        "division": "Division I",
        "conference": "SEC",
        "location": "Austin, TX",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Texas_Longhorns_logo.svg/200px-Texas_Longhorns_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=1200",
        "accent_color": "#BF5700",
    },
    {
        "name": "University of Michigan",
        "abbreviation": "MICH",
        "school": "Michigan",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "Ann Arbor, MI",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Michigan_Wolverines_logo.svg/200px-Michigan_Wolverines_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1200",
        "accent_color": "#00274C",
    },
    {
        "name": "Indiana University",
        "abbreviation": "IND",
        "school": "Indiana",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "Bloomington, IN",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Indiana_Hoosiers_logo.svg/200px-Indiana_Hoosiers_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200",
        "accent_color": "#990000",
    },
    {
        "name": "University of Southern California",
        "abbreviation": "USC",
        "school": "USC",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "Los Angeles, CA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/USC_Trojans_logo.svg/200px-USC_Trojans_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
        "accent_color": "#990000",
    },
    {
        "name": "University of Florida",
        "abbreviation": "UF",
        "school": "Florida",
        "division": "Division I",
        "conference": "SEC",
        "location": "Gainesville, FL",
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Florida_Gators_gator_logo.svg/200px-Florida_Gators_gator_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
        "accent_color": "#0021A5",
    },
    {
        "name": "NC State University",
        "abbreviation": "NCST",
        "school": "NC State",
        "division": "Division I",
        "conference": "ACC",
        "location": "Raleigh, NC",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/NC_State_Wolfpack_logo.svg/200px-NC_State_Wolfpack_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200",
        "accent_color": "#CC0000",
    },
    {
        "name": "Duke University",
        "abbreviation": "DUKE",
        "school": "Duke",
        "division": "Division I",
        "conference": "ACC",
        "location": "Durham, NC",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Duke_Blue_Devils_logo.svg/200px-Duke_Blue_Devils_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200",
        "accent_color": "#003087",
    },
    {
        "name": "Ohio State University",
        "abbreviation": "OSU",
        "school": "Ohio State",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "Columbus, OH",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ohio_State_Buckeyes_logo.svg/200px-Ohio_State_Buckeyes_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1461896836934-bd45ba8fcb84?w=1200",
        "accent_color": "#BB0000",
    },
    {
        "name": "Penn State University",
        "abbreviation": "PSU",
        "school": "Penn State",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "University Park, PA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Penn_State_Nittany_Lions_logo.svg/200px-Penn_State_Nittany_Lions_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200",
        "accent_color": "#041E42",
    },
    {
        "name": "University of Arizona",
        "abbreviation": "ARIZ",
        "school": "Arizona",
        "division": "Division I",
        "conference": "Big 12",
        "location": "Tucson, AZ",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Arizona_Wildcats_logo.svg/200px-Arizona_Wildcats_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200",
        "accent_color": "#CC0033",
    },
    {
        "name": "Louisiana State University",
        "abbreviation": "LSU",
        "school": "LSU",
        "division": "Division I",
        "conference": "SEC",
        "location": "Baton Rouge, LA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/LSU_Tigers_logo.svg/200px-LSU_Tigers_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200",
        "accent_color": "#461D7C",
    },
    {
        "name": "University of Georgia",
        "abbreviation": "UGA",
        "school": "Georgia",
        "division": "Division I",
        "conference": "SEC",
        "location": "Athens, GA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Georgia_Bulldogs_logo.svg/200px-Georgia_Bulldogs_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200",
        "accent_color": "#BA0C2F",
    },
    {
        "name": "University of Tennessee",
        "abbreviation": "TENN",
        "school": "Tennessee",
        "division": "Division I",
        "conference": "SEC",
        "location": "Knoxville, TN",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Tennessee_Volunteers_logo.svg/200px-Tennessee_Volunteers_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200",
        "accent_color": "#FF8200",
    },
    {
        "name": "Auburn University",
        "abbreviation": "AUB",
        "school": "Auburn",
        "division": "Division I",
        "conference": "SEC",
        "location": "Auburn, AL",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Auburn_Tigers_logo.svg/200px-Auburn_Tigers_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200",
        "accent_color": "#0C2340",
    },
    {
        "name": "University of Minnesota",
        "abbreviation": "MINN",
        "school": "Minnesota",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "Minneapolis, MN",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/University_of_Minnesota_Logo.svg/200px-University_of_Minnesota_Logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=1200",
        "accent_color": "#7A0019",
    },
    {
        "name": "Northwestern University",
        "abbreviation": "NW",
        "school": "Northwestern",
        "division": "Division I",
        "conference": "Big Ten",
        "location": "Evanston, IL",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Northwestern_Wildcats_logo.svg/200px-Northwestern_Wildcats_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200",
        "accent_color": "#4E2A84",
    },
    {
        "name": "University of California, Berkeley",
        "abbreviation": "CAL",
        "school": "Cal",
        "division": "Division I",
        "conference": "ACC",
        "location": "Berkeley, CA",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/California_Golden_Bears_logo.svg/200px-California_Golden_Bears_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=1200",
        "accent_color": "#003262",
    },
    {
        "name": "University of Miami",
        "abbreviation": "MIA",
        "school": "Miami",
        "division": "Division I",
        "conference": "ACC",
        "location": "Coral Gables, FL",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Miami_Hurricanes_logo.svg/200px-Miami_Hurricanes_logo.svg.png",
        "banner_url": "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1200",
        "accent_color": "#F47321",
    },
]

FIRST_NAMES_M = [
    "James", "John", "Robert", "Michael", "David", "William", "Richard",
    "Joseph", "Thomas", "Christopher", "Charles", "Daniel", "Matthew",
    "Anthony", "Mark", "Andrew", "Steven", "Ryan", "Tyler", "Brandon",
    "Kevin", "Brian", "Jason", "Justin", "Nathan", "Aaron", "Connor",
    "Jake", "Ethan", "Noah", "Liam", "Mason", "Logan", "Alexander",
    "Benjamin", "Samuel", "Jackson", "Owen", "Luke", "Caleb", "Isaac",
    "Dylan", "Carter", "Evan", "Marcus", "Trevor", "Kyle", "Sean",
    "Cole", "Garrett",
]

FIRST_NAMES_F = [
    "Emily", "Sarah", "Jessica", "Ashley", "Hannah", "Samantha",
    "Elizabeth", "Madison", "Alexis", "Abigail", "Olivia", "Emma",
    "Sophia", "Isabella", "Ava", "Mia", "Chloe", "Grace", "Lily",
    "Ella", "Natalie", "Claire", "Hailey", "Savannah", "Riley",
    "Paige", "Brooke", "Morgan", "Taylor", "Rachel", "Lauren",
    "Allison", "Megan", "Victoria", "Julia", "Kayla", "Anna",
    "Katherine", "Maya", "Zoe", "Mackenzie", "Leah", "Sydney",
    "Gabriella", "Caroline", "Audrey", "Madeline", "Faith", "Peyton",
    "Nicole",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
    "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
    "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
    "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres",
    "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker",
    "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Chen", "Kim", "Park", "Singh", "Patel", "Zhang", "Li",
    "Wang", "Brooks", "Murphy", "Sullivan", "Reed", "Cooper",
    "Ross", "Morgan", "Bell", "Kelly", "Price", "Bennett", "Wood",
]

HOMETOWNS = [
    "Los Angeles, CA", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA",
    "San Antonio, TX", "San Diego, CA", "Dallas, TX", "Austin, TX",
    "Jacksonville, FL", "Columbus, OH", "Charlotte, NC", "Indianapolis, IN",
    "Seattle, WA", "Denver, CO", "Nashville, TN", "Portland, OR",
    "Raleigh, NC", "Tampa, FL", "Atlanta, GA", "Miami, FL",
    "Minneapolis, MN", "Cleveland, OH", "Pittsburgh, PA", "Cincinnati, OH",
    "Kansas City, MO", "St. Louis, MO", "Orlando, FL", "San Jose, CA",
    "Tucson, AZ", "Honolulu, HI", "Boulder, CO", "Ann Arbor, MI",
    "Boca Raton, FL", "Scottsdale, AZ", "Madison, WI", "Savannah, GA",
    "Charleston, SC", "Naperville, IL", "Plano, TX", "Irvine, CA",
]

COACH_TITLES = [
    "Head Diving Coach", "Head Coach", "Associate Head Coach",
    "Assistant Diving Coach", "Diving Coach",
]

# Real dive codes with degree of difficulty
DIVE_CODES = [
    ("101C", 1.4), ("102C", 1.6), ("103C", 2.0), ("104C", 2.6),
    ("105C", 3.0), ("201C", 1.7), ("202C", 1.6), ("203C", 2.0),
    ("204C", 2.6), ("301C", 1.8), ("302C", 1.8), ("303C", 2.1),
    ("401C", 1.8), ("402C", 1.6), ("403C", 2.4), ("5122D", 2.0),
    ("5124D", 2.6), ("5132D", 2.2), ("5134D", 2.8), ("5152B", 3.0),
    ("5231D", 2.1), ("5233D", 2.5), ("5251B", 2.6), ("5331D", 2.2),
    ("5333D", 2.6), ("5136D", 3.3), ("107C", 3.5), ("207C", 3.3),
    ("307C", 3.4), ("6241D", 3.0),
]

YOUTUBE_VIDEOS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=3FgMLROTqJ0",
    "https://www.youtube.com/watch?v=Ct6BUPvE2sM",
    "https://www.youtube.com/watch?v=K0uHA65aKSk",
    "https://www.youtube.com/watch?v=8e07kGCGexA",
    "https://www.youtube.com/watch?v=VDvr08sCPOc",
    "https://www.youtube.com/watch?v=2I6rKMnPUiY",
    "https://www.youtube.com/watch?v=dN9OKuaYSYw",
    "https://www.youtube.com/watch?v=Nt3wp03mPlg",
    "https://www.youtube.com/watch?v=zxJF1r9XZCM",
]

BANNER_PHOTOS = [
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200",
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200",
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200",
    "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1200",
    "https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=1200",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200",
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200",
]

PLACEMENT_POINTS = [16, 13, 11, 9, 7, 5, 4, 3, 2, 1]

SEASONS = ["2024-2025", "2025-2026"]


# ─────────────────────────────────────────────────────────────────────
# SQL HELPERS
# ─────────────────────────────────────────────────────────────────────

def sql_str(val):
    """Escape a string for SQL."""
    if val is None:
        return "NULL"
    return "'" + str(val).replace("'", "''") + "'"


def sql_num(val):
    if val is None:
        return "NULL"
    return str(val)


def sql_bool(val):
    return "TRUE" if val else "FALSE"


def sql_date(d):
    if d is None:
        return "NULL"
    return f"'{d.isoformat()}'"


# ─────────────────────────────────────────────────────────────────────
# GENERATION
# ─────────────────────────────────────────────────────────────────────

def generate():
    out = sys.stdout
    p = lambda s="": out.write(s + "\n")

    # Counters for auto-increment IDs (we control them manually)
    uid = 0
    tid = 0
    cid = 0
    aid = 0
    mid = 0
    mtid = 0
    eid = 0
    meid = 0
    drid = 0
    avid = 0
    dlid = 0
    ccid = 0

    # Tracking structures
    users = []       # (id, email, role, first, last, location, avatar, banner)
    teams = []       # (id, team_dict)
    coaches = []     # (id, user_id, team_id, title, photo)
    athletes = []    # (id, user_id, team_id, first, last, gender, grad_year, hometown, avatar, skill)
    meets = []       # (id, name, date, date_end, location, course, type, season, status, logo)
    meet_teams_list = []  # (id, meet_id, team_id, gender, score) - score filled later
    events_list = [] # (id, meet_id, name, height, category, dives_req)
    entries = []     # (id, event_id, athlete_id, team_id, total_score, rank, points)
    dives = []       # (id, entry_id, num, code, dd, j1-j5, award, score, is_pb)

    p("BEGIN;")
    p()

    # ── TEAMS ──────────────────────────────────────────────────────
    p("-- Teams")
    for t in TEAMS:
        tid += 1
        teams.append((tid, t))
        p(f"INSERT INTO teams (id, name, abbreviation, school, division, conference, location, logo_url, banner_url, accent_color) "
          f"OVERRIDING SYSTEM VALUE VALUES ({tid}, {sql_str(t['name'])}, {sql_str(t['abbreviation'])}, "
          f"{sql_str(t['school'])}, {sql_str(t['division'])}, {sql_str(t['conference'])}, "
          f"{sql_str(t['location'])}, {sql_str(t['logo_url'])}, {sql_str(t['banner_url'])}, "
          f"{sql_str(t['accent_color'])});")
    p()

    # ── USERS + COACHES ────────────────────────────────────────────
    p("-- Coach users and coaches")
    used_emails = set()
    for team_id, t in teams:
        first = random.choice(FIRST_NAMES_M + FIRST_NAMES_F)
        last = random.choice(LAST_NAMES)
        email = f"{first.lower()}.{last.lower()}@{t['school'].lower().replace(' ', '')}.edu"
        while email in used_emails:
            last = random.choice(LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}@{t['school'].lower().replace(' ', '')}.edu"
        used_emails.add(email)

        uid += 1
        avatar = f"https://i.pravatar.cc/150?u=coach-{uid}"
        banner = random.choice(BANNER_PHOTOS)
        loc = t["location"]
        users.append((uid, email, "coach", first, last, loc, avatar, banner))
        p(f"INSERT INTO users (id, email, password_hash, role, first_name, last_name, location, avatar_url, banner_url) "
          f"OVERRIDING SYSTEM VALUE VALUES ({uid}, {sql_str(email)}, {sql_str(PASSWORD_HASH)}, 'coach', "
          f"{sql_str(first)}, {sql_str(last)}, {sql_str(loc)}, {sql_str(avatar)}, {sql_str(banner)});")

        cid += 1
        title = random.choice(COACH_TITLES)
        coaches.append((cid, uid, team_id, title, avatar))
        p(f"INSERT INTO coaches (id, user_id, team_id, title, photo_url) "
          f"OVERRIDING SYSTEM VALUE VALUES ({cid}, {uid}, {team_id}, {sql_str(title)}, {sql_str(avatar)});")
    p()

    # ── USERS + ATHLETES ───────────────────────────────────────────
    p("-- Athlete users and athletes")
    athletes_per_team = 5
    for team_id, t in teams:
        for i in range(athletes_per_team):
            gender = "men" if i < 3 else "women"
            if gender == "men":
                first = random.choice(FIRST_NAMES_M)
            else:
                first = random.choice(FIRST_NAMES_F)
            last = random.choice(LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}.{uid+1}@{t['school'].lower().replace(' ', '')}.edu"
            while email in used_emails:
                last = random.choice(LAST_NAMES)
                email = f"{first.lower()}.{last.lower()}.{uid+1}@{t['school'].lower().replace(' ', '')}.edu"
            used_emails.add(email)

            uid += 1
            avatar = f"https://i.pravatar.cc/150?u=athlete-{uid}"
            banner = random.choice(BANNER_PHOTOS)
            hometown = random.choice(HOMETOWNS)
            grad_year = random.choice([2025, 2026, 2027, 2028])
            skill = round(random.uniform(5.5, 7.8), 2)
            height_cm = round(random.uniform(155.0, 195.0), 2)
            loc = hometown

            users.append((uid, email, "athlete", first, last, loc, avatar, banner))
            p(f"INSERT INTO users (id, email, password_hash, role, first_name, last_name, location, avatar_url, banner_url) "
              f"OVERRIDING SYSTEM VALUE VALUES ({uid}, {sql_str(email)}, {sql_str(PASSWORD_HASH)}, 'athlete', "
              f"{sql_str(first)}, {sql_str(last)}, {sql_str(loc)}, {sql_str(avatar)}, {sql_str(banner)});")

            aid += 1
            athletes.append((aid, uid, team_id, first, last, gender, grad_year, hometown, avatar, skill))
            p(f"INSERT INTO athletes (id, user_id, team_id, first_name, last_name, gender, graduation_year, hometown, height_cm, avatar_url) "
              f"OVERRIDING SYSTEM VALUE VALUES ({aid}, {uid}, {team_id}, {sql_str(first)}, {sql_str(last)}, "
              f"{sql_str(gender)}, {grad_year}, {sql_str(hometown)}, {sql_num(height_cm)}, {sql_str(avatar)});")
    p()

    # ── MEETS ──────────────────────────────────────────────────────
    p("-- Meets")
    meet_configs = []
    season_dates = {
        "2024-2025": (date(2024, 10, 1), date(2025, 3, 31)),
        "2025-2026": (date(2025, 10, 1), date(2026, 3, 31)),
    }
    for season in SEASONS:
        start, end = season_dates[season]
        total_days = (end - start).days

        # 10 dual meets
        for _ in range(10):
            t1_idx, t2_idx = random.sample(range(len(TEAMS)), 2)
            meet_date = start + timedelta(days=random.randint(0, total_days))
            meet_name = f"{TEAMS[t1_idx]['school']} vs {TEAMS[t2_idx]['school']}"
            meet_configs.append({
                "name": meet_name,
                "date": meet_date,
                "date_end": None,
                "location": TEAMS[t1_idx]["location"],
                "course": random.choice(["SCY", "LCM"]),
                "meet_type": "dual",
                "season": season,
                "status": "completed",
                "logo_url": TEAMS[t1_idx]["logo_url"],
                "team_indices": [t1_idx, t2_idx],
            })

        # 3 invitationals
        for _ in range(3):
            host_idx = random.randint(0, len(TEAMS) - 1)
            meet_date = start + timedelta(days=random.randint(0, total_days))
            meet_name = f"{TEAMS[host_idx]['school']} Invitational"
            guest_idx = random.choice([i for i in range(len(TEAMS)) if i != host_idx])
            meet_configs.append({
                "name": meet_name,
                "date": meet_date,
                "date_end": meet_date + timedelta(days=random.choice([1, 2])),
                "location": TEAMS[host_idx]["location"],
                "course": "SCY",
                "meet_type": "invitational",
                "season": season,
                "status": "completed",
                "logo_url": TEAMS[host_idx]["logo_url"],
                "team_indices": [host_idx, guest_idx],
            })

        # 2 championships
        for conf_name in ["ACC", "SEC"]:
            conf_teams = [i for i, t in enumerate(TEAMS) if t["conference"] == conf_name]
            if len(conf_teams) < 2:
                continue
            pair = random.sample(conf_teams, 2)
            meet_date = start + timedelta(days=random.randint(total_days - 60, total_days))
            meet_configs.append({
                "name": f"{conf_name} Diving Championships",
                "date": meet_date,
                "date_end": meet_date + timedelta(days=3),
                "location": random.choice(["Atlanta, GA", "Greensboro, NC", "Indianapolis, IN"]),
                "course": "SCY",
                "meet_type": "championship",
                "season": season,
                "status": "completed" if season == "2024-2025" else "upcoming",
                "logo_url": None,
                "team_indices": pair,
            })

    for mc in meet_configs:
        mid += 1
        meets.append((mid, mc))
        p(f"INSERT INTO meets (id, name, meet_date, date_end, location, course, meet_type, season, status, logo_url) "
          f"OVERRIDING SYSTEM VALUE VALUES ({mid}, {sql_str(mc['name'])}, {sql_date(mc['date'])}, "
          f"{sql_date(mc['date_end'])}, {sql_str(mc['location'])}, {sql_str(mc['course'])}, "
          f"{sql_str(mc['meet_type'])}, {sql_str(mc['season'])}, {sql_str(mc['status'])}, "
          f"{sql_str(mc['logo_url'])});")
    p()

    # ── MEET TEAMS (placeholder scores, filled after results) ─────
    p("-- Meet teams")
    meet_team_map = {}  # (meet_id, team_id, gender) -> mtid
    for meet_id, mc in meets:
        for ti in mc["team_indices"]:
            real_team_id = ti + 1
            for gender in ["men", "women"]:
                mtid += 1
                meet_teams_list.append((mtid, meet_id, real_team_id, gender, 0))
                meet_team_map[(meet_id, real_team_id, gender)] = mtid
                p(f"INSERT INTO meet_teams (id, meet_id, team_id, gender, team_score) "
                  f"OVERRIDING SYSTEM VALUE VALUES ({mtid}, {meet_id}, {real_team_id}, {sql_str(gender)}, 0);")
    p()

    # ── EVENTS ─────────────────────────────────────────────────────
    p("-- Events")
    for meet_id, mc in meets:
        heights = random.sample(["1m", "3m", "platform"], k=random.choice([2, 3]))
        for height in heights:
            for cat in ["men", "women"]:
                dives_req = 6 if height != "platform" else random.choice([6, 8])
                eid += 1
                ename = f"{height.upper().replace('M',' Meter').replace('PLATFORM','Platform')} {dives_req} Dive"
                events_list.append((eid, meet_id, ename, height, cat, dives_req))
                p(f"INSERT INTO events (id, meet_id, event_name, height, category, dives_required) "
                  f"OVERRIDING SYSTEM VALUE VALUES ({eid}, {meet_id}, {sql_str(ename)}, "
                  f"{sql_str(height)}, {sql_str(cat)}, {dives_req});")
    p()

    # ── MEET ENTRIES + DIVE RESULTS ────────────────────────────────
    p("-- Meet entries and dive results")
    # Build athlete lookup by team and gender
    athletes_by_team_gender = {}
    for a in athletes:
        a_id, a_uid, a_tid, a_first, a_last, a_gender, a_grad, a_home, a_avatar, a_skill = a
        key = (a_tid, a_gender)
        athletes_by_team_gender.setdefault(key, []).append(a)

    # Track best score per athlete per dive code for PB flagging
    best_per_athlete_code = {}  # (athlete_id, code) -> (dive_result_id, award)

    # Collect entries per event for ranking/scoring
    event_entries = {}  # event_id -> [(entry_id, athlete_team_id, total_score)]

    # Accumulate team points per meet per team per gender
    team_points = {}  # (meet_id, team_id, gender) -> total_points

    for ev_id, ev_meet_id, ev_name, ev_height, ev_cat, ev_dives_req in events_list:
        mc = None
        for m_id, m_cfg in meets:
            if m_id == ev_meet_id:
                mc = m_cfg
                break

        event_athletes = []
        for ti in mc["team_indices"]:
            real_team_id = ti + 1
            pool = athletes_by_team_gender.get((real_team_id, ev_cat), [])
            count = min(len(pool), random.choice([2, 3]))
            chosen = random.sample(pool, count) if len(pool) >= count else pool
            for a in chosen:
                event_athletes.append((a, real_team_id))

        event_entry_scores = []

        for a, a_team_id in event_athletes:
            a_id, a_uid, a_tid, a_first, a_last, a_gender, a_grad, a_home, a_avatar, a_skill = a
            meid += 1
            entry_total = 0.0
            entry_dives = []

            for dn in range(1, ev_dives_req + 1):
                code, dd = random.choice(DIVE_CODES)
                base = a_skill
                judges = []
                for _ in range(5):
                    j = round(base + random.uniform(-1.2, 1.2), 1)
                    j = max(0.0, min(10.0, j))
                    judges.append(j)
                sorted_j = sorted(judges)
                middle_3 = sorted_j[1:4]
                award = round(dd * sum(middle_3), 3)
                entry_total += award

                drid += 1
                entry_dives.append((drid, meid, dn, code, dd, judges, award, award, False))

                key = (a_id, code)
                if key not in best_per_athlete_code or award > best_per_athlete_code[key][1]:
                    best_per_athlete_code[key] = (drid, award)

            entry_total = round(entry_total, 3)
            entries.append((meid, ev_id, a_id, a_team_id, entry_total, 0, 0))
            dives.extend(entry_dives)
            event_entry_scores.append((meid, a_team_id, entry_total))

        # Rank entries and assign placement points
        event_entry_scores.sort(key=lambda x: -x[2])
        for rank_idx, (me_id, me_team_id, me_score) in enumerate(event_entry_scores):
            rank = rank_idx + 1
            pts = PLACEMENT_POINTS[rank_idx] if rank_idx < len(PLACEMENT_POINTS) else 0
            # Update the entry
            for i, e in enumerate(entries):
                if e[0] == me_id:
                    entries[i] = (me_id, e[1], e[2], e[3], me_score, rank, pts)
                    break
            # Accumulate team points
            tpk = (ev_meet_id, me_team_id, ev_cat)
            team_points[tpk] = team_points.get(tpk, 0) + pts

    # Print entries
    for me_id, me_ev, me_ath, me_team, me_score, me_rank, me_pts in entries:
        p(f"INSERT INTO meet_entries (id, event_id, athlete_id, team_id, final_rank, total_score, points) "
          f"OVERRIDING SYSTEM VALUE VALUES ({me_id}, {me_ev}, {me_ath}, {me_team}, "
          f"{sql_num(me_rank)}, {sql_num(me_score)}, {sql_num(me_pts)});")
    p()

    # Flag personal bests
    pb_ids = set(dr_id for dr_id, _ in best_per_athlete_code.values())

    # Print dive results
    p("-- Dive results")
    for dr_id, dr_me, dr_num, dr_code, dr_dd, judges, dr_award, dr_score, _ in dives:
        is_pb = dr_id in pb_ids
        p(f"INSERT INTO dive_results (id, meet_entry_id, dive_number, dive_code, dd, j1, j2, j3, j4, j5, award, score, is_personal_best) "
          f"OVERRIDING SYSTEM VALUE VALUES ({dr_id}, {dr_me}, {dr_num}, {sql_str(dr_code)}, {sql_num(dr_dd)}, "
          f"{sql_num(judges[0])}, {sql_num(judges[1])}, {sql_num(judges[2])}, {sql_num(judges[3])}, {sql_num(judges[4])}, "
          f"{sql_num(dr_award)}, {sql_num(dr_score)}, {sql_bool(is_pb)});")
    p()

    # ── UPDATE MEET TEAM SCORES ────────────────────────────────────
    p("-- Update meet team scores")
    for (m_id, t_id, g), pts in team_points.items():
        mt_id = meet_team_map.get((m_id, t_id, g))
        if mt_id:
            p(f"UPDATE meet_teams SET team_score = {pts} WHERE id = {mt_id};")
    p()

    # ── COLLEGE COMMITMENTS ────────────────────────────────────────
    p("-- College commitments")
    commit_athletes = random.sample(athletes, min(15, len(athletes)))
    for a in commit_athletes:
        a_id = a[0]
        school_idx = random.randint(0, len(TEAMS) - 1)
        school = TEAMS[school_idx]
        ccid += 1
        cdate = date(2025, random.randint(1, 12), random.randint(1, 28))
        quote = random.choice([
            "Thrilled to continue my diving career here!",
            "Can't wait to compete at the next level.",
            "Dream school, dream team. Let's go!",
            "So grateful for this opportunity.",
            "Excited to join such an amazing program!",
            "Ready to make an impact on day one.",
            "This has been my goal since I was 12.",
            "Blessed to announce my commitment!",
            "The coaching staff made this an easy choice.",
            "Looking forward to representing this program.",
        ])
        p(f"INSERT INTO college_commitments (id, athlete_id, school_name, school_logo_url, commitment_date, quote) "
          f"OVERRIDING SYSTEM VALUE VALUES ({ccid}, {a_id}, {sql_str(school['name'])}, "
          f"{sql_str(school['logo_url'])}, {sql_date(cdate)}, {sql_str(quote)});")
    p()

    # ── ATHLETE VIDEOS ─────────────────────────────────────────────
    p("-- Athlete videos")
    video_athletes = random.sample(athletes, min(20, len(athletes)))
    for a in video_athletes:
        a_id = a[0]
        # Pick a random dive result for this athlete
        athlete_dives = [d for d in dives if any(
            e[0] == d[1] and e[2] == a_id for e in entries
        )]
        dr_link = random.choice(athlete_dives)[0] if athlete_dives else None
        avid += 1
        vid_url = random.choice(YOUTUBE_VIDEOS)
        title = f"{a[3]} {a[4]} - Dive Highlight"
        p(f"INSERT INTO athlete_videos (id, athlete_id, dive_result_id, video_url, title) "
          f"OVERRIDING SYSTEM VALUE VALUES ({avid}, {a_id}, {sql_num(dr_link)}, {sql_str(vid_url)}, {sql_str(title)});")
    p()

    # ── DIVE LIST SIMULATIONS ──────────────────────────────────────
    p("-- Dive list simulations")
    sim_athletes = random.sample(athletes, min(10, len(athletes)))
    for a in sim_athletes:
        a_id = a[0]
        dlid += 1
        total_dd = round(sum(random.choice(DIVE_CODES)[1] for _ in range(6)), 2)
        proj = round(total_dd * random.uniform(5.5, 7.5) * 3, 3)
        p(f"INSERT INTO dive_list_simulations (id, athlete_id, title, total_dd, projected_score) "
          f"OVERRIDING SYSTEM VALUE VALUES ({dlid}, {a_id}, {sql_str('Competition Dive List')}, {sql_num(total_dd)}, {sql_num(proj)});")
    p()

    # ── RESET SEQUENCES ───────────────────────────────────────────
    p("-- Reset identity sequences")
    p(f"SELECT setval(pg_get_serial_sequence('users', 'id'), {uid});")
    p(f"SELECT setval(pg_get_serial_sequence('teams', 'id'), {tid});")
    p(f"SELECT setval(pg_get_serial_sequence('coaches', 'id'), {cid});")
    p(f"SELECT setval(pg_get_serial_sequence('athletes', 'id'), {aid});")
    p(f"SELECT setval(pg_get_serial_sequence('meets', 'id'), {mid});")
    p(f"SELECT setval(pg_get_serial_sequence('meet_teams', 'id'), {mtid});")
    p(f"SELECT setval(pg_get_serial_sequence('events', 'id'), {eid});")
    p(f"SELECT setval(pg_get_serial_sequence('meet_entries', 'id'), {meid});")
    p(f"SELECT setval(pg_get_serial_sequence('dive_results', 'id'), {drid});")
    p(f"SELECT setval(pg_get_serial_sequence('athlete_videos', 'id'), {avid});")
    p(f"SELECT setval(pg_get_serial_sequence('dive_list_simulations', 'id'), {dlid});")
    p(f"SELECT setval(pg_get_serial_sequence('college_commitments', 'id'), {ccid});")
    p()

    p("COMMIT;")

    # Summary to stderr
    sys.stderr.write(f"\n=== Seed Data Summary ===\n")
    sys.stderr.write(f"  Teams:              {tid}\n")
    sys.stderr.write(f"  Users:              {uid}\n")
    sys.stderr.write(f"  Coaches:            {cid}\n")
    sys.stderr.write(f"  Athletes:           {aid}\n")
    sys.stderr.write(f"  Meets:              {mid}\n")
    sys.stderr.write(f"  Meet Teams:         {mtid}\n")
    sys.stderr.write(f"  Events:             {eid}\n")
    sys.stderr.write(f"  Meet Entries:       {meid}\n")
    sys.stderr.write(f"  Dive Results:       {drid}\n")
    sys.stderr.write(f"  College Commits:    {ccid}\n")
    sys.stderr.write(f"  Videos:             {avid}\n")
    sys.stderr.write(f"  Simulations:        {dlid}\n")
    sys.stderr.write(f"  TOTAL ROWS:         {tid+uid+cid+aid+mid+mtid+eid+meid+drid+ccid+avid+dlid}\n")
    sys.stderr.write(f"=========================\n\n")


if __name__ == "__main__":
    generate()
