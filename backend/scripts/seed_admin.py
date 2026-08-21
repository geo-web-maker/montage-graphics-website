"""Run once, after deploying this update, to create your superadmin account.

Two modes:

1. Migrate the existing env-var admin as-is (keeps the same password hash,
   so your current login password still works):
     python -m scripts.seed_admin --migrate --name "George" --email you@example.com --phone +2567...

2. Create a brand-new superadmin with a temp password sent via SMS
   (same flow as creating any other admin later):
     python -m scripts.seed_admin --fresh --name "George" --email you@example.com --phone +2567...

Run from backend/ with your .env / Render env vars loaded, since this reads
mongodb_uri, admin_password_hash, and the EgoSMS settings from app.config.
"""

import argparse
import asyncio

from app.config import get_settings
from app.core.security import hash_password
from app.core.sms import generate_temp_password, send_temp_password_sms
from app.database import close_mongo_connection, connect_to_mongo, get_database


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--phone", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--migrate", action="store_true", help="Reuse the current admin_password_hash env var")
    mode.add_argument("--fresh", action="store_true", help="Generate + SMS a new temp password")
    args = parser.parse_args()

    connect_to_mongo()
    db = get_database()

    existing = await db.admin_users.find_one({"email": args.email})
    if existing:
        print(f"An admin with email {args.email} already exists — nothing to do.")
        close_mongo_connection()
        return

    if args.migrate:
        settings = get_settings()
        if not settings.admin_password_hash:
            print("admin_password_hash is empty in settings — use --fresh instead.")
            close_mongo_connection()
            return
        password_hash = settings.admin_password_hash
        must_change = False
        print("Migrated your existing admin password — log in with it as before.")
    else:
        temp_password = generate_temp_password()
        password_hash = hash_password(temp_password)
        must_change = True
        sms_sent = await send_temp_password_sms(args.name, args.phone, temp_password)
        print(f"Temp password: {temp_password} (SMS sent: {sms_sent})")

    await db.admin_users.insert_one(
        {
            "name": args.name,
            "email": args.email,
            "phone": args.phone,
            "role": "superadmin",
            "password_hash": password_hash,
            "must_change_password": must_change,
        }
    )
    print(f"Created superadmin {args.email}.")
    close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
