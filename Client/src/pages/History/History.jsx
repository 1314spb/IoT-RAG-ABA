import React, { useEffect, useState, useMemo, useLayoutEffect } from "react";
import { useNavigate } from 'react-router-dom';

import Datepicker from "react-tailwindcss-datepicker";

import DataChart from './DataChart';
import StudentDropdown from '../../components/StudentDropdown';

import { axioStudentData } from "../../utils/axioStudentData";

import { students } from "../../demoData/studentsData";
import { domains } from "../../demoData/domainsData";

const History = () => {
	const navigate = useNavigate();
	const [axioedData, setAxioedData] = useState({ sessions: [], student_id: null });
	const [selectedDate, setSelectedDate] = useState({ startDate: null, endDate: null });

	const [openDropdown, setOpenDropdown] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(students[0]);
	const [selectedDomain, setSelectedDomain] = useState(domains[0]);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useLayoutEffect(() => {
		document.title = "History - ABA";
	}, []);

	useEffect(() => {
		axioStudentData(selectedStudent.id, { setLoading, setError, setAxioedData, setSelectedDate })
	}, [selectedStudent]);

	const handleDomainClick = (domain) => {
		// console.log(`Clicked on: ${domain.name}`);
		setSelectedDomain(domain);
	};

	const handleDateChange = (newValue) => {
		// console.log("Selected dates:", newValue);
		setSelectedDate(newValue);
	};

	const handleAiGenerate = () => {
		navigate('/services/ai_generate');
	};

	const handleChartZoom = (zoomData) => {
		if (zoomData) {
			setSelectedDate({
				startDate: zoomData.startDate,
				endDate: zoomData.endDate,
			});
		} else {
			setSelectedDate({ startDate: null, endDate: null });
		}
	};

	const filteredSessions = useMemo(() => {
		let sessions = axioedData.sessions || [];

		if (selectedDate.startDate && selectedDate.endDate) {
			const start = new Date(selectedDate.startDate);
			const end = new Date(selectedDate.endDate);
			sessions = sessions.filter(session => {
				const sessionDate = new Date(session.date);
				return sessionDate >= start && sessionDate <= end;
			});
		}

		if (selectedDomain) {
			sessions = sessions.filter(session => session.domain === selectedDomain.name);
		}

		return sessions;
	}, [axioedData, selectedDate, selectedDomain]);

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8">
			<h6 className="font-mono text-3xl leading-tight text-gray-900 mb-1.5 py-2">Student History</h6>

			<div className="bg-red-200 p-4 rounded-md flex justify-start items-center gap-x-4">
				<StudentDropdown
					students={students}
					selectedStudent={selectedStudent}
					setSelectedStudent={setSelectedStudent}
					openDropdown={openDropdown}
					setOpenDropdown={setOpenDropdown}
				/>

				<div className="relative flex items-center">
					<Datepicker
						value={selectedDate}
						onChange={handleDateChange}
						primaryColor={"teal"}
						containerClassName="w-72"
						inputClassName="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-3 xl:col-span-3">
					<h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5 pt-5 w-72">Domains</h2>
					<ul role="list" className="p-6 divide-y divide-slate-200 max-h-full overflow-y-auto">
						{domains.map((domain) => (
							<li key={domain.id} className="flex py-4 first:pt-0 last:pb-0">
								<button
									onClick={() => handleDomainClick(domain)}
									className={`flex items-center w-full text-left focus:outline-none hover:bg-green-100 p-2 rounded ${selectedDomain.id === domain.id ? 'bg-green-200' : ''}`}
								>
									{domain.Icon ? (
										<domain.Icon className="h-10 w-10 text-gray-500" />
									) : (
										<img
											className="h-10 w-10 rounded-full"
											src="/images/default-domain.png"
											alt={domain.name}
										/>
									)}
									<div className="ml-3 overflow-hidden">
										<p className="text-sm font-medium text-slate-900">{domain.name}</p>
									</div>
								</button>
							</li>
						))}
					</ul>
				</div>

				<div className="col-span-9 xl:col-span-9 pt-5">
					{error !== null ? (
						<div className="p-6 bg-red-100 text-red-700 rounded-lg shadow mb-4">
							<p>{error}</p>
						</div>
					) : null}
					{loading ? (
						<div className="p-6 bg-white rounded-lg shadow">
							<p>Loading...</p>
						</div>
					) : filteredSessions && filteredSessions.length > 0 ? (
						<div className="p-6 bg-white rounded-lg shadow">
							<button
								className="mb-4 bg-lime-100 hover:bg-lime-200 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
								type="button"
								onClick={handleAiGenerate}
							>
								AI Task Generate
							</button>
							<DataChart dataArray={filteredSessions} onZoom={handleChartZoom} />
						</div>
					) : (
						<div className="p-6 bg-white rounded-lg shadow">
							<p>No data can be displayed</p>
						</div>
					)
					}
				</div>
			</div>
		</section>
	);
}
export default History;