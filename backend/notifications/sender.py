import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY", "")

FROM_EMAIL = os.getenv("FROM_EMAIL", "Pulse <noreply@yourpulsedomain.com>")

def send_report_email(to_email: str, topic: str, report: str, score: int, share_url: str = ""):
    """Send a research report via email."""
    if not resend.api_key:
        print(f"   [Email] RESEND_API_KEY not set — skipping email to {to_email}")
        return

    snippet = report[:600].replace("\n", "<br>") + "..."
    share_section = f'<p><a href="{share_url}" style="color:#6366f1;">View full report →</a></p>' if share_url else ""

    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; color: #e6edf3; background: #0d1117; padding: 32px; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
            <span style="background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">PULSE MONITOR</span>
        </div>
        <h1 style="font-size: 20px; margin-bottom: 8px;">New research ready: {topic}</h1>
        <p style="color: #7d8590; font-size: 14px; margin-bottom: 20px;">Quality Score: <strong style="color: {'#3fb950' if score >= 7 else '#d29922'}">{score}/10</strong></p>
        <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 20px; font-size: 14px; color: #7d8590; line-height: 1.7; margin-bottom: 20px;">
            {snippet}
        </div>
        {share_section}
        <p style="font-size: 12px; color: #7d8590; margin-top: 24px;">You're receiving this because you have a Pulse monitor set up for this topic. <a href="#" style="color:#6366f1;">Manage monitors</a></p>
    </div>
    """

    try:
        params = resend.Emails.SendParams(
            from_=FROM_EMAIL,
            to=[to_email],
            subject=f"📊 Research ready: {topic[:60]}",
            html=html,
        )
        resend.Emails.send(params)
        print(f"   [Email] Sent report to {to_email}")
    except Exception as e:
        print(f"   [Email] Failed to send: {e}")


def send_weekly_digest(to_email: str, reports: list[dict]):
    """Send a weekly digest of all monitor reports."""
    if not resend.api_key or not reports:
        return

    items_html = "".join([
        f"""
        <div style="border-left: 3px solid {'#3fb950' if r['score'] >= 7 else '#6366f1'}; padding: 12px 16px; margin-bottom: 16px; background: #161b22; border-radius: 0 8px 8px 0;">
            <div style="font-weight: 700; font-size: 15px; color: #e6edf3; margin-bottom: 4px;">{r['topic']}</div>
            <div style="font-size: 12px; color: #7d8590; margin-bottom: 8px;">Score: <strong style="color: {'#3fb950' if r['score'] >= 7 else '#d29922'}">{r['score']}/10</strong></div>
            <p style="font-size: 13px; color: #7d8590; margin: 0; line-height: 1.6;">{r.get('snippet', '')}</p>
            {f'<a href="{r["share_url"]}" style="color:#6366f1; font-size:13px; display:inline-block; margin-top:8px;">Read full report →</a>' if r.get('share_url') else ''}
        </div>
        """
        for r in reports
    ])

    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; color: #e6edf3; background: #0d1117; padding: 32px; border-radius: 12px;">
        <h1 style="font-size: 22px; margin-bottom: 4px;">Your Weekly Research Digest</h1>
        <p style="color: #7d8590; font-size: 14px; margin-bottom: 28px;">{len(reports)} monitor{'s' if len(reports) != 1 else ''} updated this week</p>
        {items_html}
        <p style="font-size: 12px; color: #7d8590; margin-top: 24px; border-top: 1px solid #21262d; padding-top: 16px;">
            Pulse · Your autonomous research analyst · <a href="#" style="color:#6366f1;">Manage monitors</a>
        </p>
    </div>
    """

    try:
        params = resend.Emails.SendParams(
            from_=FROM_EMAIL,
            to=[to_email],
            subject=f"📬 Your Weekly Pulse Digest — {len(reports)} reports",
            html=html,
        )
        resend.Emails.send(params)
        print(f"   [Digest] Sent weekly digest to {to_email}")
    except Exception as e:
        print(f"   [Digest] Failed: {e}")
