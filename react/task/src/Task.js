import React from 'react';

function Task({ task, onDelete, onComplete }) {
  const { _id, title, description, priority, dueDate, isCompleted, employeeEmail } = task;

  return (
    <li style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '0.5rem', listStyleType: "none", opacity: isCompleted ? 0.5 : 1 }}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <p><strong>Priority:</strong> {priority}</p>
      {dueDate && <p><strong>Due:</strong> {new Date(dueDate).toLocaleDateString()}</p>}
      {employeeEmail && <p><strong>Assigned to:</strong> {employeeEmail}</p>}
      {(
        <button onClick={() => onComplete(_id, isCompleted)}>Mark as {isCompleted ? "Incompleted" : "Completed"}</button>
    )}
      <button onClick={() => onDelete(_id)}>Delete</button>
    </li>
  );
}

export default Task;
