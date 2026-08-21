import React, { useMemo, useState } from "react";
import { voidInvoice, getInvoiceViewUrl, getInvoicePdfUrl } from "../api/client";

function formatMoney(n) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0 });
}

export default function InvoiceList({ token, invoices, onVoided }) {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Group by client, each group's invoices newest-first, groups ordered by
  // their own most recent invoice — so the client with the latest activity
  // surfaces (and opens) first without a separate "sort" control.
  const groups = useMemo(() => {
    const byClient = new Map();
    for (const inv of invoices) {
      if (!byClient.has(inv.client_name)) byClient.set(inv.client_name, []);
      byClient.get(inv.client_name).push(inv);
    }
    const list = [...byClient.entries()].map(([client_name, invs]) => {
      const sorted = [...invs].sort((a, b) => (a.date < b.date ? 1 : -1));
      return {
        client_name,
        invoices: sorted,
        total: sorted.reduce((sum, i) => sum + i.total, 0),
        mostRecent: sorted[0]?.date || "",
      };
    });
    list.sort((a, b) => (a.mostRecent < b.mostRecent ? 1 : -1));
    return list;
  }, [invoices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.trim().toLowerCase();
    return groups.filter((g) => g.client_name.toLowerCase().includes(q));
  }, [groups, search]);

  const [openClient, setOpenClient] = useState(null);
  const effectiveOpen = openClient ?? groups[0]?.client_name ?? null;

  async function handleVoid(publicId) {
    if (!confirm("Void this invoice? This can't be undone.")) return;
    setBusyId(publicId);
    try {
      const updated = await voidInvoice(token, publicId);
      onVoided(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopy(publicId) {
    try {
      await navigator.clipboard.writeText(getInvoiceViewUrl(publicId));
      setCopiedId(publicId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      alert(getInvoiceViewUrl(publicId));
    }
  }

  if (invoices.length === 0) {
    return <p className="admin-empty">No invoices yet — create one above.</p>;
  }

  return (
    <div>
      <input
        className="admin-invoice-search"
        placeholder="Search by client name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && <p className="admin-empty">No clients match "{search}".</p>}

      <div className="admin-client-list">
        {filtered.map((group) => {
          const isOpen = effectiveOpen === group.client_name;
          return (
            <div className={`admin-client-row${isOpen ? " open" : ""}`} key={group.client_name}>
              <button
                className="admin-client-header"
                onClick={() => setOpenClient(isOpen ? "" : group.client_name)}
              >
                <span className="admin-client-name">{group.client_name}</span>
                <span className="admin-client-slug">
                  {group.invoices.length} invoice{group.invoices.length !== 1 ? "s" : ""} ·{" "}
                  {formatMoney(group.total)}
                </span>
                <span className="admin-chevron">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="admin-client-body">
                  <div className="admin-invoice-rows">
                    {group.invoices.map((inv) => (
                      <div className="admin-invoice-row" key={inv.public_id}>
                        <div className="admin-invoice-info">
                          <span className="admin-invoice-number">{inv.invoice_number}</span>
                          <span className="admin-invoice-date">{inv.date}</span>
                          <span className="admin-invoice-total">{formatMoney(inv.total)}</span>
                          {inv.voided && <span className="admin-voided-badge">Voided</span>}
                        </div>
                        <div className="admin-invoice-actions">
                          <button className="btn-ghost" onClick={() => handleCopy(inv.public_id)}>
                            {copiedId === inv.public_id ? "Copied!" : "Copy link"}
                          </button>
                          <a
                            className="btn-ghost"
                            href={getInvoicePdfUrl(inv.public_id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View PDF
                          </a>
                          {!inv.voided && (
                            <button
                              className="btn-danger"
                              onClick={() => handleVoid(inv.public_id)}
                              disabled={busyId === inv.public_id}
                            >
                              {busyId === inv.public_id ? "..." : "Void"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
