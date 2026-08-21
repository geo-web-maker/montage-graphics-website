from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.services import pdf_service

router = APIRouter(prefix="/i", tags=["invoices (public)"])


async def _get_invoice_or_404(db: AsyncIOMotorDatabase, public_id: str) -> dict:
    invoice = await db.invoices.find_one({"public_id": public_id})
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.get("/{public_id}", response_class=HTMLResponse)
async def view_invoice(
    request: Request, public_id: str, db: AsyncIOMotorDatabase = Depends(get_database)
):
    invoice = await _get_invoice_or_404(db, public_id)
    base_url = str(request.base_url)
    html = pdf_service.render_html(invoice, base_url)
    return HTMLResponse(content=html)


@router.get("/{public_id}/pdf")
async def invoice_pdf(
    request: Request, public_id: str, db: AsyncIOMotorDatabase = Depends(get_database)
):
    invoice = await _get_invoice_or_404(db, public_id)
    base_url = str(request.base_url)
    pdf_bytes = pdf_service.render_pdf(invoice, base_url)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{invoice["invoice_number"]}.pdf"'
        },
    )
