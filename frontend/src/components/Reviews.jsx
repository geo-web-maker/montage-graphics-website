import React from "react";
import { REVIEWS } from "../data";

export default function Reviews() {
  return (
    <section className="reviews" id="reviews">
      <div className="work-head">
        <h2>Client feedback</h2>
      </div>
      <div className="review-grid">
        {REVIEWS.map((review, i) => (
          <div className="review-card" key={i}>
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
