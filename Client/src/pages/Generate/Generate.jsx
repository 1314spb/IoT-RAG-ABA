import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

import PassGeneratedTask from "./PassGeneratedTask";
import StudentDropdown from "../../components/StudentDropdown";
import DomainDropdown from "../../components/DomainDropdown";

import axioGenerate from "../../utils/axioGenerate"

import { domains } from "../../demoData/domainsData"
import { students } from "../../demoData/studentsData"

const Generate = () => {
	const location = useLocation();
	const { domain, student_id } = location.state || {};

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);


	const foundDomain = domains.find((d) => d.name === domain);
	const foundStudent = students.find((s) => s.id === student_id);

	const [openDropdown, setOpenDropdown] = useState(null);
	const [selectedStudent, setSelectedStudent] = useState(foundStudent ? foundStudent : students[0]);
	const [selectedDomain, setSelectedDomain] = useState(foundDomain || domains[0]);
	const [additionalNeed, setAdditionalNeed] = useState('');
	const [generatedTask, setGeneratedTask] = useState(null);

	const handleGenerateTask = async () => {
		setLoading(true);

		const payload = {
			student_id: selectedStudent.id,
			domain: selectedDomain.name,
			additionalNeed: additionalNeed.trim(),
		};

		const response_data = await axioGenerate(payload);
		// console.log("response_data:", response_data);
	};

	useEffect(() => {
		document.title = "AI Task Generate | ABA";
	}, []);

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8">
			<h6 className="font-mono text-3xl leading-tight text-gray-900 mb-1.5 py-2">AI Task Generate</h6>

			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-3 xl:col-span-3">
					<h2 className="font-mono text-xl leading-tight text-gray-900 mb-1.5 pt-5 w-72">Parameters selection</h2>

					<StudentDropdown
						students={students}
						selectedStudent={selectedStudent}
						setSelectedStudent={setSelectedStudent}
						openDropdown={openDropdown}
						setOpenDropdown={setOpenDropdown}
					/>

					<DomainDropdown
						domains={domains}
						selectedDomain={selectedDomain}
						setSelectedDomain={setSelectedDomain}
						openDropdown={openDropdown}
						setOpenDropdown={setOpenDropdown}
					/>

					<div className="mt-4">
						<label htmlFor="additional-need" className="flex block text-sm font-medium text-gray-700 mb-1">
							Additional Need:
						</label>
						<textarea
							id="additional-need"
							name="additional-need"
							value={additionalNeed}
							onChange={(e) => setAdditionalNeed(e.target.value)}
							rows={4}
							className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							style={{ minHeight: '8em' }}
							placeholder="Enter any additional requirements here..."
						/>
					</div>

					<div className="mt-4">
						<button
							type="button"
							className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-lime-100 hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							onClick={handleGenerateTask}
						>
							Generate Task
						</button>
					</div>
				</div>

				<div className="col-span-9 xl:col-span-9 rounded-lg shadow grid grid-cols-10">
					<div className="col-span-7 bg-gray-100 rounded-lg m-1">
					</div>
					<div className="col-span-3 bg-blue-50 rounded-lg m-1">
						<PassGeneratedTask student_id={44} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default Generate;