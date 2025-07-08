import axios from 'axios';
import React, { useState, useEffect } from 'react';
import TaskCard from '../components/Task';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import socket from '../socket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('High');

  const statuses = ['Todo', 'In Progress', 'Done'];

  useEffect(() => {
    if (user === null ) navigate('/login');
  }, [user]);

  useEffect(() => {
  const fetchData = async () => {
    console.log(user);
    if (!user) return;
    // console.log(user);
    try {
  const res = await axios.get(`http://localhost:3000/task-api?email=${user.email}`, {
    withCredentials: true,
  });
  setTasks(res.data.tasks);
} catch (err) {
  console.error('🔥 TASK FETCH ERROR:', {
    message: err.message,
    response: err.response?.data,
    status: err.response?.status,
  });
  toast.error('Failed to fetch tasks');
}


    if (user.role === 'admin') {
      try {
        const res = await axios.get('http://localhost:3000/logs', {
          withCredentials: true,
        });
        setLogs(res.data.logs);
      } catch (err) {
        toast.error('Failed to fetch logs');
      }
    }
  };

  fetchData();
}, [user]);


  useEffect(() => {
    socket.on('task-updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      toast.info(`🔄 Task updated: "${updatedTask.title}"`);
    });

    socket.on('task-created', (newTask) => {
      setTasks(prev => [...prev, newTask]);
      toast.success(`🆕 New task: "${newTask.title}"`);

      if (user?.email === newTask.assignedTo) {
        toast(`📌 Assigned to you: "${newTask.title}"`);
      }
    });

    socket.on('task-deleted', (taskId) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.info(`🗑️ A task was deleted`);
    });

    return () => {
      socket.off('task-updated');
      socket.off('task-created');
      socket.off('task-deleted');
    };
  }, [user]);

  const handleDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;

    const taskToMove = tasks.find(t => t._id === draggableId);
    const updatedTask = { ...taskToMove, status: destination.droppableId };

    try {
      const res = await axios.put(`http://localhost:3000/tasks/${updatedTask._id}`, updatedTask, {
        withCredentials: true,
      });

      if (res.data.success) {
        setTasks(prev =>
          prev.map(t => (t._id === updatedTask._id ? res.data.updated : t))
        );
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const serverTask = err.response.data.serverTask;
        toast.error('⚠️ Conflict! Task was updated by someone else.');
        setTasks(prev =>
          prev.map(t => (t._id === serverTask._id ? serverTask : t))
        );
      } else {
        toast.error('Error updating task');
      }
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newTask = {
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'Todo',
    };

    try {
      const res = await axios.post('http://localhost:3000/api/tasks', newTask, {
        withCredentials: true,
      });

      if (res.data.success) {
        const task = res.data.task;
        setTasks([...tasks, { ...task, id: task._id }]);
        socket.emit('new-task', task);
        setNewTitle('');
        setNewDesc('');
        setNewPriority('High');
      }
    } catch (err) {
      toast.error('Error adding task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await axios.delete(`http://localhost:3000/tasks/${taskId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setTasks(prev => prev.filter(t => t._id !== taskId));
        toast.success('🗑️ Task deleted');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handle_logout = async () => {
    try {
      const res = await axios.get('http://localhost:3000/logout-api' ,{
        withCredentials: true,
      });
      if (res.data.success) navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  if (user === undefined) return <div>Loading...</div>;

  return (
    <div style={styles.page}>
      <ToastContainer position="top-right" autoClose={3000} />
      <header style={styles.header}>
        <h2 style={styles.title}>📋 CollabBoard Dashboard</h2>
        <button style={styles.logout} onClick={handle_logout}>Logout</button>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button onClick={handleAddTask} style={{ marginLeft: '10px' }}>
          ➕ Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={styles.board}>
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={styles.column}
                >
                  <h3 style={{ ...styles.columnTitle, color: getColor(status) }}>{status}</h3>
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} />
                            <p style={{ fontSize: '12px', marginTop: '5px' }}>
                              Assigned to: <strong>{task.assignedTo}</strong>
                            </p>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(task._id)}
                                style={{
                                  backgroundColor: '#e74c3c',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  marginTop: '6px',
                                  fontSize: '12px'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {user.role === 'admin' && (
        <div style={{ marginTop: '40px' }}>
          <h3>🕒 Activity Log (Admin)</h3>
          <ul style={{ fontFamily: 'monospace' }}>
            {logs.map((log) => (
              <li key={log._id}>
                <strong>{log.email}</strong> {log.action} task <em>"{log.taskTitle}"</em> at{' '}
                {new Date(log.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const getColor = (status) => {
  if (status === 'Todo') return '#ffc107';
  if (status === 'In Progress') return '#17a2b8';
  return '#28a745';
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
  },
  logout: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  board: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  column: {
    flex: '1',
    minWidth: '280px',
    maxWidth: '32%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    boxSizing: 'border-box',
  },
  columnTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
};

export default Dashboard;
