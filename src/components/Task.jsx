import React from 'react';

const TaskCard = ({ task }) => {
  return (
    <div style={styles.card}>
      <h4 style={styles.title}>{task.title}</h4>
      <p style={styles.desc}>{task.description}</p>
      <span style={{ ...styles.badge, backgroundColor: task.priority === 'High' ? '#dc3545' : '#ffc107' }}>
        {task.priority}
      </span>
      <p className="text-sm text-gray-600">
          Assigned to: <strong>{task.assignedTo || 'Unassigned'}</strong>
      </p>

    </div>
  );
};

const styles = {
  card: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '12px',
    position: 'relative',
  },
  title: {
    fontSize: '1.1rem',
    margin: 0,
    fontWeight: 'bold',
    color: '#333',
  },
  desc: {
    fontSize: '0.9rem',
    margin: '6px 0',
    color: '#666',
  },
  badge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    fontSize: '0.7rem',
    padding: '4px 8px',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: 'bold',
  },
};

export default TaskCard;
