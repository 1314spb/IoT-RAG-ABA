import React, { useEffect, useState } from "react";
import axio from "axios";

import 'react-calendar/dist/Calendar.css';
import {
	Button,
} from "@material-tailwind/react";

import CalendarPicker from "../../components/CalendarPicker";
import DomainDropdown from "../../components/DomainDropdown";
import StudentDropdown from "../../components/StudentDropdown";
import StatusDropdown from "../../components/StatusDropdown";

import { students } from "../../demoData/studentsData";
import { domains } from "../../demoData/domainsData";
import { status } from "../../demoData/statusData";

const Add = () => {
	const [openStudentDropdown, setOpenStudentDropdown] = useState(false);
	const [openDomainDropdown, setOpenDomainDropdown] = useState(false);
	const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedStudent, setSelectedStudent] = useState(students[0]);
	const [selectedDomain, setSelectedDomain] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState(null);
	const [task, setTask] = useState("");
	const [subTask, setSubTask] = useState("");
	const [description, setDescription] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSubmit = async (data) => {
		console.log(data);
		setLoading(true);

		if (
			!data.date ||
			!data.student ||
			!data.domain ||
			!data.status ||
			!data.task ||
			!data.subTask ||
			!data.description
		) {
			setError("All fields are required.");
			setLoading(false);
			return;
		}

		console.log(data);

		try {
			const response = await axio.post("http://localhost:5000/tasks", data);
			console.log(response);
			setLoading(false);
			setError(null);

		} catch (error) {
			setError(error.message);
			setLoading(false);
		}
	}

	useEffect(() => {
		document.title = "Add Task | ABA";
		console.log("Add Task Page");
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8">
			<h6 className="font-mono text-3xl leading-tight text-gray-900 mb-1.5 py-2 select-none">Add Task</h6>

			{error && <div className="text-red-500 mb-4">{error}</div>}

			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-4 xl:col-span-4">
					<div className="container flex flex-wrap items-center gap-3 mx-auto px-4 sm:px-6 lg:px-8">
						<StudentDropdown
							students={students}
							selectedStudent={selectedStudent}
							setSelectedStudent={setSelectedStudent}
							openDropdown={openStudentDropdown}
							setOpenDropdown={setOpenStudentDropdown}
						/>
					</div>

					<CalendarPicker
						selectedDate={selectedDate}
						setSelectedDate={setSelectedDate}
					/>
				</div>

				<div className="col-span-8 xl:col-span-8 rounded-lg shadow p-1">
					<div className="rounded-lg bg-gray-100 p-1 h-full">
						<div className="p-4 grid grid-cols-2 gap-6">
							<DomainDropdown
								domains={domains}
								selectedDomain={selectedDomain}
								setSelectedDomain={setSelectedDomain}
								openDropdown={openDomainDropdown}
								setOpenDropdown={setOpenDomainDropdown}
							/>

							<StatusDropdown
								status={status}
								selectedStatus={selectedStatus}
								setSelectedStatus={setSelectedStatus}
								openDropdown={openStatusDropdown}
								setOpenDropdown={setOpenStatusDropdown}
							/>

							<div>
								<label htmlFor="task" className="flex block mb-2 text-sm font-medium text-gray-900 dark:text-white">Task</label>
								<input
									type="text"
									id="task"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="Task"
									value={task || ""}
									onChange={(e) => setTask(e.target.value)}
									required
								/>
							</div>

							<div>
								<label htmlFor="sub_task" className="flex block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sub-Task</label>
								<input
									type="text"
									id="task"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="Sub-Task"
									value={subTask || ""}
									onChange={(e) => setSubTask(e.target.value)}
									required
								/>
							</div>

							<div className="col-span-2">
								<label
									htmlFor="description"
									className="block mb-2 text-sm font-medium text-gray-900 flex"
								>
									Description
								</label>
								<textarea
									id="description"
									rows="5"
									placeholder="Description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="bg-gray-50 border border-gray-300 
               text-gray-900 text-sm rounded-lg 
               focus:ring-blue-500 focus:border-blue-500 
               block w-full p-2.5"
								></textarea>
							</div>

							<Button
								color="blue"
								type="button"
								onClick={
									() => handleSubmit({
										date: selectedDate,
										student: selectedStudent,
										domain: selectedDomain,
										status: selectedStatus,
										task: task,
										subTask: subTask,
										description: description,
									})
								}
							>
								Submit
							</Button>
						</div>
					</div>
				</div>
			</div>

		</section>
	);
};

export default Add;