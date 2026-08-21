"""EgoSMS wrapper for temp-password delivery on admin creation/reset.
Ported from SACHI's app/core/sms.py — same gateway, same debug-mode pattern.
"""

import logging
import secrets
import string

import httpx

from app.config import get_settings

logger = logging.getLogger("montage.sms")

EGOSMS_URL = "https://comms.egosms.co/api/v1/plain/"


def generate_temp_password() -> str:
    """8-char alphanumeric — short enough to read off an SMS, long enough
    to satisfy the account's own minimum password length."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(8))


async def send_sms_via_egosms(to_number: str, message_text: str) -> bool:
    settings = get_settings()
    if settings.sms_debug_mode:
        # Local/dev only: never hit the real EgoSMS API. Log the message
        # (which contains the temp password) so it can be read back during
        # testing, and report success so the normal flow proceeds.
        logger.info(f"[SMS_DEBUG_MODE] SMS to {to_number}: {message_text}")
        return True
    try:
        clean_number = to_number.replace("+", "").strip()
        params = {
            "username": settings.egosms_username,
            "password": settings.egosms_password,
            "number": clean_number,
            "message": message_text,
            "sender": settings.egosms_sender_id,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(EGOSMS_URL, params=params, timeout=15.0)
            resp_text = response.text.strip()
            logger.info(f"EgoSMS result for {to_number}: {resp_text}")
            return "OK" in resp_text.upper()
    except Exception as e:
        logger.error(f"EgoSMS connection error: {e}")
        return False


async def send_temp_password_sms(name: str, phone: str, temp_password: str) -> bool:
    message = (
        f"Hello {name}, your temporary Montage Graphics admin login password "
        f"is {temp_password}. You'll be asked to set a new password when you "
        f"sign in. Do not share this code with anyone."
    )
    return await send_sms_via_egosms(phone, message)
