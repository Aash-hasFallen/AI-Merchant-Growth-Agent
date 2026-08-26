"""
email_service.py — sends the welcome email via SMTP.

Configured entirely through environment variables; nothing here is
hardcoded. If SMTP is not configured, sending is skipped gracefully
rather than raising, so the frontend still gets a clean response instead
of a 500 when the merchant hasn't set up an email provider yet.

Required environment variables (all optional — if SMTP_HOST is unset,
send_welcome_email() no-ops and reports "skipped"):

    SMTP_HOST          e.g. smtp.sendgrid.net
    SMTP_PORT          e.g. 587 (default: 587)
    SMTP_USERNAME       SMTP auth username
    SMTP_PASSWORD       SMTP auth password / API key
    SMTP_FROM_EMAIL    the "From" address, e.g. noreply@yourdomain.com
    SMTP_USE_TLS       "true" / "false" (default: "true")
"""
import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)

WELCOME_SUBJECT = "Welcome to AI Merchant Growth Agent"


def _welcome_body() -> str:
    return (
        "Hi,\n\n"
        "Thanks for your interest in AI Merchant Growth Agent.\n"
        "You can now explore the merchant decision workflow — submit a "
        "customer request and watch the agent recommend, price, and "
        "validate an offer against merchant policy.\n\n"
        "— The AI Merchant Growth Agent team"
    )


class EmailServiceError(Exception):
    pass


def is_configured() -> bool:
    return bool(os.environ.get("SMTP_HOST", "").strip())


def send_welcome_email(to_email: str) -> None:
    """
    Sends the welcome email. Raises EmailServiceError on failure so the
    caller can decide how to respond (the API endpoint below turns this
    into a graceful "skipped" result rather than a 500).
    """
    host = os.environ.get("SMTP_HOST", "").strip()
    if not host:
        logger.info("SMTP not configured (SMTP_HOST unset); skipping welcome email to %s", to_email)
        return

    port = int(os.environ.get("SMTP_PORT", "587"))
    username = os.environ.get("SMTP_USERNAME", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    from_email = os.environ.get("SMTP_FROM_EMAIL", username or "noreply@example.com")
    use_tls = os.environ.get("SMTP_USE_TLS", "true").strip().lower() != "false"

    message = EmailMessage()
    message["Subject"] = WELCOME_SUBJECT
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(_welcome_body())

    try:
        with smtplib.SMTP(host, port, timeout=10) as server:
            if use_tls:
                server.starttls()
            if username and password:
                server.login(username, password)
            server.send_message(message)
    except Exception as e:
        logger.error("Failed to send welcome email to %s: %s", to_email, e)
        raise EmailServiceError(str(e)) from e
