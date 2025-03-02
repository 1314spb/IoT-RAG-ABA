import React, { useEffect, useState } from "react";
import 'react-calendar/dist/Calendar.css';
import {
	List,
	ListItem,
	ListItemPrefix,
	Input,
	Select,
	Option,
	Textarea,
	Button,
} from "@material-tailwind/react";

import CalendarPicker from "../../components/CalendarPicker";
import DomainDropdown from "../../components/DomainDropdown";
import StudentDropdown from "../../components/StudentDropdown";

import { students } from "../../demoData/studentsData";
import { domains } from "../../demoData/domainsData";

const Add = () => {
	const [openStudentDropdown, setOpenStudentDropdown] = useState(false);
	const [openDomainDropdown, setOpenDomainDropdown] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(students[0]);
	const [selectedDomain, setSelectedDomain] = useState(null);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

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
						<form className="p-4 grid grid-cols-2 gap-6">
							<DomainDropdown
								domains={domains}
								selectedDomain={selectedDomain}
								setSelectedDomain={setSelectedDomain}
								openDropdown={openDomainDropdown}
								setOpenDropdown={setOpenDomainDropdown}
							/>

							<Input
								variant="static"
								label="Task"
								placeholder="Task"
								size="md"
								color="blue"
							/>

							<Input size="md" color="blue" label="Sub-Task" />

							<Select label="Status" color="blue">
								<Option value="pending">Pending</Option>
								<Option value="ongoing">Ongoing</Option>
								<Option value="completed">Completed</Option>
							</Select>

							<Textarea color="blue" label="Description" />

							<Button color="blue" type="submit">
								Submit
							</Button>
						</form>
					</div>
				</div>
			</div>

		</section>
	);
};

export default Add;