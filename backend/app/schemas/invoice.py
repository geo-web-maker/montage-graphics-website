from datetime import date, datetime

from pydantic import BaseModel, Field, computed_field

from app.schemas.common import PyObjectId


class InvoiceItemIn(BaseModel):
    description: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)


class InvoiceItemOut(InvoiceItemIn):
    @computed_field
    @property
    def amount(self) -> float:
        return round(self.quantity * self.unit_price, 2)


class InvoiceCreate(BaseModel):
    client_name: str
    date: date
    due_date: date
    items: list[InvoiceItemIn]
    tax_rate: float = Field(default=0, ge=0, le=1)
    accounting_manager: str = "Montage Graphics"
    contact_phone: str | None = None
    contact_email: str | None = None
    payment_method: str | None = None
    payment_number: str | None = None
    payment_name: str | None = None
    notes: str | None = None


class InvoiceOut(BaseModel):
    # validation_alias (not alias) so Mongo's "_id" is accepted on the way in,
    # but the JSON sent to the frontend uses "id".
    id: PyObjectId = Field(validation_alias="_id")
    public_id: str
    invoice_number: str
    client_name: str
    date: date
    due_date: date
    items: list[InvoiceItemOut]
    subtotal: float
    tax: float
    total: float
    balance: float
    accounting_manager: str
    contact_phone: str | None = None
    contact_email: str | None = None
    payment_method: str | None = None
    payment_number: str | None = None
    payment_name: str | None = None
    notes: str | None = None
    voided: bool = False
    verification_code: str
    created_by: str | None = None
    created_at: datetime

    class Config:
        populate_by_name = True


class InvoiceListItem(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    public_id: str
    invoice_number: str
    client_name: str
    date: date
    total: float
    voided: bool = False

    class Config:
        populate_by_name = True
