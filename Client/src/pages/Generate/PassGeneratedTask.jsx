import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const PassGeneratedTask = ({ className = '', student_id }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!student_id) return;

        const axioTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                // const response = await axios.get(`/api/tasks?student_id=${student_id}`);
                const response = await axios.get(`/temp_past_generated_tasks.json`);
                setTasks(response.data);
            } catch (err) {
                console.error(err);
                setError('Cannot connect to server');
            } finally {
                setLoading(false);
            }
        };

        axioTasks();
    }, [student_id]);

    useEffect(() => {
        console.log(tasks);
    }, [tasks]);

    if (loading) {
        return <div className={className}>Loading...</div>;
    }

    if (error) {
        return <div className={`${className} text-red-500`}>{error}</div>;
    }

    return (
        <div className={className}>
            <h3 className="text-xl font-bold mb-2">Past Generated Tasks</h3>
            {tasks.length === 0 ? (
                <p>No pass generated tasks</p>
            ) : (
                <ul className="list-disc list-inside">
                    {tasks.map(task => (
                        <li key={task.task_id} className="mb-2">
                            <strong>Task:</strong> {task.task} <br />
                            <strong>Sub-task:</strong> {task.sub_task} <br />
                            <strong>Date:</strong> {task.date} <br />
                            <strong>Status:</strong> {task.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

PassGeneratedTask.propTypes = {
    className: PropTypes.string,
    student_id: PropTypes.number.isRequired,
};

export default PassGeneratedTask;