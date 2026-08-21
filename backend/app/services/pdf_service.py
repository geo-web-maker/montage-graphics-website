from datetime import date, datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


def _as_date(value) -> date:
    """Mongo stores date/due_date as ISO strings (see invoice_service);
    the template calls .strftime() on them, so convert back before
    rendering."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def _render_context(invoice: dict) -> dict:
    ctx = dict(invoice)
    ctx["date"] = _as_date(invoice["date"])
    ctx["due_date"] = _as_date(invoice["due_date"])
    # Stored items only have description/quantity/unit_price (see
    # invoice_service.create_invoice, which dumps InvoiceItemIn — the
    # computed "amount" only exists on InvoiceItemOut, used for the API
    # response, never persisted). Compute it here so the template's
    # {{ item.amount }} always has something to format.
    ctx["items"] = [
        {**item, "amount": round(item["quantity"] * item["unit_price"], 2)}
        for item in invoice["items"]
    ]
    return ctx


def render_html(invoice: dict, base_url: str | None = None) -> str:
    template = _env.get_template("invoice.html")
    ctx = _render_context(invoice)
    # The browser preview (public_invoices.view_invoice) needs a real,
    # servable URL for the logo — main.py mounts TEMPLATES_DIR/assets at
    # /assets for exactly this. PDF rendering (render_pdf below) calls
    # this with base_url=None on purpose: it wants the plain relative
    # path instead, which WeasyPrint resolves straight off disk against
    # TEMPLATES_DIR (see below) — no network round-trip, same reasoning
    # as the fonts baked into the Dockerfile.
    ctx["logo_url"] = f"{base_url}assets/logo.png" if base_url else "assets/logo.png"
    return template.render(invoice=ctx)


def render_pdf(invoice: dict, base_url: str | None = None) -> bytes:
    html_str = render_html(invoice)  # no base_url -> relative "assets/logo.png"
    return HTML(string=html_str, base_url=str(TEMPLATES_DIR)).write_pdf()
