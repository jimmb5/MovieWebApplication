import React from "react";
import "./MediaDetails.css";

export default function MediaDetails() {
  const title = "Batman";

  return (
    <div className="media-details">
      <main className="media-details-content">
        <div className="details-layout">
          <div className="poster">posteri</div>

          <div className="details">
            <div className="header-row">
              <h1>{title}</h1>
              <button>Lisää suosikiksi</button>
            </div>

            <div className="meta-row darker-text">
              <span>year</span>

              <span>duration</span>

              <span>ageRating</span>
            </div>

            <div className="description-row">
              <h2>Overview</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Dolores eius consequatur sint. Dolores ullam ducimus recusandae
                architecto nostrum quam doloribus, facere enim ab fuga, totam
                laboriosam facilis amet fugit quod!'
              </p>
            </div>

            <div className="info-table-row">
              <span className="darker-text">Starring</span>
              <span>cast</span>

              <span className="darker-text">Director</span>
              <span>director</span>

              <span className="darker-text">Writer</span>
              <span>writer</span>

              <span className="darker-text">Genre</span>
              <span>genre</span>
            </div>

            <div className="rating-row">tähtiarvostelu</div>
          </div>
        </div>
      </main>
    </div>
  );
}
