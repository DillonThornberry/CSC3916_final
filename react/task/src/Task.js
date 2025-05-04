import React from 'react';

function Task({ task, onDelete }) {
  const { _id, title, description, priority, dueDate } = task;

  return (
    <li style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '0.5rem', listStyleType: "none" }}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <p><strong>Priority:</strong> {priority}</p>
      {dueDate && <p><strong>Due:</strong> {new Date(dueDate).toLocaleDateString()}</p>}
      <button onClick={() => onDelete(_id)}>Delete</button>
    </li>
  );
}

export default Task;
