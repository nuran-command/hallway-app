import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Boards({ boards }) {
  return (
    <ul>
      {boards.map(board => (
        <li key={board.id}>
          <Link to={`/board/${board.id}`}>{board.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Boards;