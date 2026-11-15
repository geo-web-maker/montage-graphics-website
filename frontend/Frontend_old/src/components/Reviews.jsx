import React, { useEffect, useState } from "react";
import { getReviews } from "../api/client";

function ReviewGrid({ reviews }) {
  return (
    <div className="review-grid">
      {reviews.map((review) => (
        <div className="review-card" key={review.id}>
          <span className="mark">&#8220;</span>
          <p>{review.quote}</p>
          <div className="who">
            <span>{review.who}</span>
            {review.role}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewTicker({ reviews }) {
  // Duplicated once so the marquee (translateX -50%) loops seamlessly —
  // same pattern as Trusted By / Recent Work.
  const items = [...reviews, ...reviews];
  return (
    <div className="review-ticker-outer">
      <div className="review-ticker-track">
        {items.map((review, i) => (
          <div className="review-ticker-item" key={`${review.id}-${i}`}>
            <span className="mark">&#8220;</span>
            <p>{review.quote}</p>
            <div className="who">
              <span>{review.who}</span>
              {review.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Adaptive: 4 or fewer reviews renders the static grid; past that it
// switches to a rolling ticker automatically — no manual toggle needed.
function renderReviews(reviews) {
  return reviews.length <= 4 ? (
    <ReviewGrid reviews={reviews} />
  ) : (
    <ReviewTicker reviews={reviews} />
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch((err) => console.error("Failed to load reviews:", err));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="reviews plain" id="reviews">
      <div className="center-head">
        <div className="label">Exhibit 05</div>
        <h2>Client Feedback</h2>
      </div>
      {renderReviews(reviews)}
    </section>
  );
}
