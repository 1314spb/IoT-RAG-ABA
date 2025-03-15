import React, { useState, useLayoutEffect, useEffect } from "react";

import { students } from "../../demoData/studentsData";

import axioGetSum from "../../utils/axioGetSum";

import StudentDropdown from "../../components/StudentDropdown";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

const Analysis = () => {
	const [openStudentDropdown, setOpenStudentDropdown] = useState(false);
	const [sum, setSum] = useState(null);

	const [selectedStudent, setSelectedStudent] = useState(students[0]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useLayoutEffect(() => {
		document.title = "Analysis | ABA";
	});

	useEffect(() => {
		console.log("useEffect is running");
	}, []);

	useEffect(() => {
		console.log("Selected Student:", selectedStudent);
		const fetchData = async () => {
			setLoading(true);
			setError(false);
			console.log("Hello from Analysis.jsx");
			try {
				await axioGetSum({ student_id: selectedStudent.id, setSum: setSum });
			} catch (error) {
				setError(error.message);
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [selectedStudent]);

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8">
			<h6 className="font-mono text-3xl leading-tight text-gray-900 mb-1.5 py-2">Analysis</h6>

			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-3 xl:col-span-3">
					<h2 className="font-mono text-xl leading-tight text-gray-900 mb-1.5 pt-5 w-72 select-none">Parameters selection</h2>

					<StudentDropdown
						students={students}
						selectedStudent={selectedStudent}
						setSelectedStudent={setSelectedStudent}
						openDropdown={openStudentDropdown}
						setOpenDropdown={setOpenStudentDropdown}
					/>
				</div>

				<div className="col-span-6 xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 shadow rounded-lg">
					{loading && <p>Loading task...</p>}
					{error && <p className="text-red-500">Error: {error}</p>}
					{!loading && !error && sum && (
						Object.keys(sum).map((category, index) => {
							const total =
								sum[category].value.plus_sum +
								sum[category].value.minus_sum +
								sum[category].value.p_sum +
								sum[category].value.ot_sum;


							const data = [
								{ id: 'Plus', value: sum[category].value.plus_sum, label: "+" },
								{ id: 'Minus', value: sum[category].value.minus_sum, label: "-" },
								{ id: 'P Sum', value: sum[category].value.p_sum, label: "P", color: 'orange' },
								{ id: 'OT Sum', value: sum[category].value.ot_sum, label: "OT" },
							];

							return (
								<div key={index} className="p-4">
									<h3 className="text-lg font-semibold">{category.replaceAll("_", " ")}</h3>
									<PieChart
										series={[
											{
												data: data,
												arcLabel: (item) => `${((item.value / total) * 100).toFixed(1)}%`,
												highlightScope: { fade: 'global', highlight: 'item' },
												innerRadius: 30,
												outerRadius: 80,
												labelFormatter: (value) => {
													const percentage = ((value.value / total) * 100).toFixed(1);
													return `${value.id}: ${percentage}%`;
												}
											},
										]}
										sx={{
											[`& .${pieArcLabelClasses.root}`]: {
												fill: 'white',
												fontSize: 14,
											},
										}}
										width={260}
										height={260}
									/>
								</div>
							);
						})
					)}

				</div>
			</div>
		</section>
	);
};

export default Analysis;