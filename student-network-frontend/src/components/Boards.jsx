import React from "react";
import { Link } from "react-router-dom";

function Boards({ boards }) {
  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h2 style={{ marginBottom: 25, opacity: 0.9 }}>Boards</h2>

      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        }}
      >
        {boards.map((b) => (
          <Link
            key={b.id}
            to={`/board/${b.id}`}
            style={{
              textDecoration: "none",
              color: "white",
              padding: "20px",
              background: "rgba(70, 60, 120, 0.35)",
              border: "1px solid rgba(150, 130, 255, 0.25)",
              borderRadius: 12,
              boxShadow: "0 0 10px rgba(120,100,255,0.15)",
              transition: "0.25s",
            }}
          >
            <h3 style={{ margin: 0 }}>{b.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Boards;