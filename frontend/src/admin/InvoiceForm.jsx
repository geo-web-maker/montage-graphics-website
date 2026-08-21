import React, { useState } from "react";
import { createInvoice } from "../api/client";

const emptyItem = () => ({ description: "", quantity: 1, unit_price: 0 });

export default function InvoiceForm({ token, onCreated }) {
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [paymentName, setPaymentName] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function updateItem(i, field, value) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(i) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function reset() {
    setClientName("");
    setDate("");
    setDueDate("");
    setItems([emptyItem()]);
    setTaxRate(0);
    setContactPhone("");
    setContactEmail("");
    setPaymentMethod("");
    setPaymentNumber("");
    setPaymentName("");
    setNotes("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const invoice = await createInvoice(token, {
        client_name: clientName,
        date,
        due_date: dueDate,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
        tax_rate: Number(taxRate) / 100,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        payment_method: paymentMethod || null,
        payment_number: paymentNumber || null,
        payment_name: paymentName || null,
        notes: notes || null,
      });
      onCreated(invoice);
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card">
      <h2>New invoice</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Client name</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        </div>

        <div className="admin-field-row">
          <div className="admin-field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="admin-field">
            <label>Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="admin-field">
          <label>Items</label>
          <div className="admin-item-rows">
            {items.map((it, i) => (
              <div className="admin-item-row" key={i}>
                <input
                  className="admin-item-desc"
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  required
                />
                <input
                  className="admin-item-qty"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  required
                />
                <input
                  className="admin-item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Unit price"
                  value={it.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-danger admin-item-remove"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-ghost admin-item-add" onClick={addItem}>
            + Add item
          </button>
        </div>

        <div className="admin-field">
          <label>Tax rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
        </div>

        <div className="admin-field-row">
          <div className="admin-field">
            <label>Contact phone</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Contact email</label>
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
        </div>

        <div className="admin-field-row">
          <div className="admin-field">
            <label>Payment method</label>
            <input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Payment number</label>
            <input value={paymentNumber} onChange={(e) => setPaymentNumber(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Registered name</label>
            <input value={paymentName} onChange={(e) => setPaymentName(e.target.value)} />
          </div>
        </div>

        <div className="admin-field">
          <label>Notes</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="admin-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create invoice"}
        </button>
      </form>
    </div>
  );
}
