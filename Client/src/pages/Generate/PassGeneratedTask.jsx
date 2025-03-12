import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { axioPassGeneratedTask } from '../../utils/axioPassGeneratedTask';

const PassGeneratedTask = ({ className = '', student_id }) => {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [expandedTaskIds, setExpandedTaskIds] = useState([]);

	useEffect(() => {
		if (!student_id) return;

		axioPassGeneratedTask({ setLoading, setError, setTasks, student_id });
	}, [student_id]);

	const toggleExpand = (taskId) => {
		setExpandedTaskIds((prev) =>
			prev.includes(taskId)
				? prev.filter((id) => id !== taskId)
				: [...prev, taskId]
		);
	};

	if (loading) {
		return <div className={className}>Loading...</div>;
	}

	if (error) {
		return <div className={`${className} text-red-500`}>{error}</div>;
	}

	return (
		<div className={className}>
			<h3 className="text-lg font-bold m-2 font-mono">Past Generated Tasks</h3>
			<div className='flex justify-around mb-4'>
				<kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-green-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 select-none">+</kbd>
				<kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-red-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 select-none">-</kbd>
				<kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-yellow-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 select-none">OT</kbd>
				<kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 select-none">P</kbd>
			</div>

			{tasks.length === 0 ? (
				<p>No pass generated tasks</p>
			) : (
				<ul className="space-y-2 p-2 text-sm max-h-96 overflow-y-auto">
					{tasks.map(task => {
						const isExpanded = expandedTaskIds.includes(task.task_id);
						return (
							<li
								key={task.task_id}
								className={`border p-4 rounded-md cursor-pointer ${task.status === "+" ? 'bg-green-100' :
									task.status === "-" ? 'bg-red-100' :
										task.status === "OT" ? 'bg-yellow-100' :
											'bg-white'
									}`}
								onClick={() => toggleExpand(task.task_id)}
							>
								<div className="flex justify-between items-center">
									<div>
										<p className='flex'><strong>Task:</strong>&nbsp;{task.task}</p>
										<p className='flex'><strong>Sub-task:</strong>&nbsp;{task.subtask}</p>
										<p className='flex'><strong>Status:</strong>&nbsp;{task.status}</p>
										<p className='flex text-xs text-zinc-400'>{task.date}</p>
									</div>
									<svg
										className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</div>
								{isExpanded && (
									<div className="mt-2">
										<p className='text-left'>{task.description}</p>
									</div>
								)}
							</li>
						);
					})}
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