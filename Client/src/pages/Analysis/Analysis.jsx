import React, { useState, useLayoutEffect } from "react";

import { students } from "../../demoData/studentsData";

import StudentDropdown from "../../components/StudentDropdown";

const Analysis = () => {
	const [openStudentDropdown, setOpenStudentDropdown] = useState(false);

	const [selectedStudent, setSelectedStudent] = useState(students[0]);
	const [additionalNeed, setAdditionalNeed] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [generatedTask, setGeneratedTask] = useState(null);

	useLayoutEffect(() => {
		document.title = "Analysis | ABA";
	});

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8">
			<h6 className="font-mono text-3xl leading-tight text-gray-900 mb-1.5 py-2">Analysis</h6>

			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-3 xl:col-span-3">
					<h2 className="font-mono text-xl leading-tight text-gray-900 mb-1.5 pt-5 w-72">Parameters selection</h2>

					<StudentDropdown
						students={students}
						selectedStudent={selectedStudent}
						setSelectedStudent={setSelectedStudent}
						openDropdown={openStudentDropdown}
						setOpenDropdown={setOpenStudentDropdown}
					/>
				</div>

				<div className="col-span-9 xl:col-span-9 rounded-lg shadow grid grid-cols-10">
					<div className="col-span-7 bg-gray-100 rounded-lg m-1">
						{loading && <p>Loading generated task...</p>}
						{error && <p className="text-red-500">Error: {error}</p>}
						{generatedTask ? (
							<div>
								<h3 className="font-bold text-xl mb-2">Generated Task</h3>
								<pre className="whitespace-pre-wrap">
									{JSON.stringify(generatedTask, null, 2)}
								</pre>
							</div>
						) : (
							!loading && <p>No generated task to display yet.</p>
						)}
					</div>

				</div>
			</div>
		</section>
	);
};

export default Analysis;