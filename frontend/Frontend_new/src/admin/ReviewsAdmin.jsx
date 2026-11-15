import React, { useState } from "react";
import { createReview, updateReview, deleteReview, approveReview, rejectReview, reorderReviews } from "../api/client";

export default function ReviewsAdmin({ token, reviews, onCreated, onDeleted, onModerated }) {
  const [quote, setQuote] = useState("");
  const [who, setWho] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [tab,setTab]=useState("pending");
  const [editId,setEditId]=useState(null);
  const [editValues,setEditValues]=useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const review = await createReview(token, {
        quote,
        who,
        role,
        display_order: reviews.length,
      });
      onCreated(review);
      setQuote("");
      setWho("");
      setRole("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function moderate(id, action) {
    setBusyId(id);
    try { if(action==="approve") await approveReview(token,id); else await rejectReview(token,id); onModerated?.(); }
    catch(err){setError(err.message)} finally {setBusyId(null)}
  }

  async function saveEdit(id){setBusyId(id);try{await updateReview(token,id,editValues);setEditId(null);onModerated?.()}catch(err){setError(err.message)}finally{setBusyId(null)}}
  async function moveReview(index,dir,items){const next=[...items],j=index+dir;if(j<0||j>=next.length)return;[next[index],next[j]]=[next[j],next[index]];setBusy(true);try{await reorderReviews(token,next.map(x=>x.id));onModerated?.()}catch(err){setError(err.message)}finally{setBusy(false)}}

  async function handleDelete(id) {
    if (!confirm("Delete this review?")) return;
    setBusyId(id);
    try {
      await deleteReview(token, id);
      onDeleted(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-card">
      <h2>Add client review</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Quote</label>
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} required />
        </div>
        <div className="admin-field">
          <label>Name</label>
          <input value={who} onChange={(e) => setWho(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Role (optional, e.g. "Restaurant owner")</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        {error && <p className="admin-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Add review"}
        </button>
      </form>

      <div className="review-admin-tabs"><button className={tab==="pending"?"active":""} onClick={()=>setTab("pending")}>Pending ({reviews.filter(r=>r.status==="pending").length})</button><button className={tab==="live"?"active":""} onClick={()=>setTab("live")}>Published ({reviews.filter(r=>r.status!=="pending"&&r.status!=="rejected").length})</button><button className={tab==="rejected"?"active":""} onClick={()=>setTab("rejected")}>Rejected ({reviews.filter(r=>r.status==="rejected").length})</button></div>
      {reviews.filter(r=>tab==="pending"?r.status==="pending":tab==="rejected"?r.status==="rejected":r.status!=="pending"&&r.status!=="rejected").length > 0 ? (
        <div className="admin-review-list">
          {reviews.filter(r=>tab==="pending"?r.status==="pending":tab==="rejected"?r.status==="rejected":r.status!=="pending"&&r.status!=="rejected").map((r,index,items) => (
            <div className="admin-review-row" key={r.id}>
              <div className="admin-review-text">
                <p>&#8220;{r.quote}&#8221;</p>
                <span>
                  {r.who}
                  {r.role ? ` — ${r.role}` : ""}
                </span>
              </div>
              <span className="review-status">{r.status || (r.is_visible ? "live" : "pending")}</span>
              {editId===r.id?<div className="review-edit"><textarea rows={3} value={editValues.quote||""} onChange={e=>setEditValues({...editValues,quote:e.target.value})}/><input value={editValues.who||""} onChange={e=>setEditValues({...editValues,who:e.target.value})}/><input value={editValues.role||""} onChange={e=>setEditValues({...editValues,role:e.target.value})}/><button onClick={()=>saveEdit(r.id)} disabled={busyId===r.id}>Save</button><button onClick={()=>setEditId(null)}>Cancel</button></div>:<><button className="btn-ghost" onClick={()=>{setEditId(r.id);setEditValues({quote:r.quote,who:r.who,role:r.role||""})}}>Edit</button><button className="btn-ghost" onClick={async()=>{try{await updateReview(token,r.id,{is_visible:!r.is_visible});onModerated?.()}catch(e){setError(e.message)}}}>{r.is_visible?"Hide":"Show"}</button><button className="btn-ghost" onClick={()=>moveReview(index,-1,items)} disabled={index===0}>↑</button><button className="btn-ghost" onClick={()=>moveReview(index,1,items)} disabled={index===items.length-1}>↓</button></>}
              {r.status === "pending" && <button className="btn-primary" onClick={() => moderate(r.id,"approve")} disabled={busyId===r.id}>Approve</button>}
              {r.status === "pending" && <button className="btn-secondary" onClick={() => moderate(r.id,"reject")} disabled={busyId===r.id}>Reject</button>}
              <button
                className="btn-danger"
                onClick={() => handleDelete(r.id)}
                disabled={busyId === r.id}
              >
                {busyId === r.id ? "..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      ) : <p className="admin-empty">No {tab} reviews.</p>}
    </div>
  );
}
