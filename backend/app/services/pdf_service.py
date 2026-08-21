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
    return ctx


def render_html(invoice: dict, base_url: str | None = None) -> str:
    template = _env.get_template("invoice.html")
    return template.render(invoice=_render_context(invoice))


def render_pdf(invoice: dict, base_url: str | None = None) -> bytes:
    html_str = render_html(invoice)
    return HTML(string=html_str, base_url=str(TEMPLATES_DIR)).write_pdf()
