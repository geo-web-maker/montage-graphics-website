import React, { useEffect, useState } from "react";
import { getReviews } from "../api/client";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch((err) => console.error("Failed to load reviews:", err));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="reviews" id="reviews">
      <div className="work-head">
        <h2>Client feedback</h2>
      </div>
      <div className="review-grid">
        {reviews.map((review) => (
          <div className="review-card" key={review.id}>
            <span className="mark">&#8220;</span>
            <p>{review.quote}</p>
            <div className="who">
              {review.who}
              <span>{review.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
