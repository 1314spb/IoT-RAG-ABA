import React, { useEffect, useState, useRef } from "react";
import PassGeneratedTask from "./PassGeneratedTask";

import axios from 'axios';

import Domain1 from "../../assets/domains/domain1";
import Domain2 from "../../assets/domains/domain2";
import Domain3 from "../../assets/domains/domain3";
import Domain4 from "../../assets/domains/domain4";
import Domain5 from "../../assets/domains/domain5";
import Domain6 from "../../assets/domains/domain6";

import student1 from "../../assets/students/student1.jpg";
import student2 from "../../assets/students/student2.jpg";
import student3 from "../../assets/students/student3.jpg";
import student4 from "../../assets/students/student4.jpg";
import student5 from "../../assets/students/student5.jpg";
import student6 from "../../assets/students/student6.jpg";

const students = [
    { id: 41, name: "John Doe", phone: "1234567890", image: student1 },
    { id: 42, name: "Mary Jane", phone: "1234567890", image: student2 },
    { id: 43, name: "Peter Parker", phone: "1234567890", image: student3 },
    { id: 44, name: "Tony Stark", phone: "1234567890", image: student4 },
    { id: 45, name: "Bruce Wayne", phone: "1234567890", image: student5 },
    { id: 46, name: "Clark Kent", phone: "1234567890", image: student6 },
];

const domains = [
    { id: 1, name: "Academic and Learning", Icon: Domain1 },
    { id: 2, name: "Social Emotion", Icon: Domain2 },
    { id: 3, name: "Communication", Icon: Domain3 },
    { id: 4, name: "Sensory Motor Skill", Icon: Domain4 },
    { id: 5, name: "Independent and Self-help", Icon: Domain5 },
    { id: 6, name: "Behavioural Development", Icon: Domain6 },
];

const Generate = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(students[0]);
    const [selectedDomain, setSelectedDomain] = useState(domains[0]);
    const [additionalNeed, setAdditionalNeed] = useState('');

    const [axioedData, setAxioedData] = useState({ sessions: [] });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const studentDropdownRef = useRef(null);
    const domainDropdownRef = useRef(null);

    useEffect(() => {
        document.title = "AI Task Generate";

        const handleClickOutside = (event) => {
            if (openDropdown === 'student' && studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
            if (openDropdown === 'domain' && domainDropdownRef.current && !domainDropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdown]);

    useEffect(() => {
        axioStudentData(selectedStudent.id);
    }, [selectedStudent]);

    const axioStudentData = (studentId) => {
        setLoading(true);
        setError(null);

        axios.get("/temp.json")
            .then(response => {
                console.log("Axioed temp data: ", response.data);
                if (response.data.sessions.length === 0) {
                    setAxioedData({ sessions: [], student_id: response.data.student_id });
                } else {
                    setAxioedData(response.data);
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Cannot axio student data");
            })
            .finally(() => setLoading(false));

        // axios.get(`/api/students/${studentId}`)
        //     .then(response => {
        //         if (response.data.sessions.length === 0) {
        //             setAxioedData({ sessions: [], student_id: response.data.student_id });
        //         } else {
        //             setAxioedData(response.data);
        //         }
        //     })
        //     .catch((err) => {
        //         console.error(err);
        //         setError("Cannot axio student data");
        //     })
        //     .finally(() => setLoading(false));
    };

    const handleStudentClick = (student) => {
        setAxioedData([]);
        setSelectedStudent(student);
        setOpenDropdown(null);
    };

    const handleDomainClick = (domain) => {
        console.log(`Clicked on: ${domain.name}`);
        setSelectedDomain(domain);
        setOpenDropdown(null);
    };

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h6 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5 py-2">AI Task Generate</h6>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 xl:col-span-3">
                    <h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5 pt-5 w-72">Parameters selection</h2>

                    <div className="mb-4">
                        <label htmlFor="student-dropdown" className="flex block text-sm font-medium text-gray-700 mb-1">
                            Select Student:
                        </label>
                        <div className="relative" ref={studentDropdownRef}>
                            <button
                                id="student-dropdown"
                                onClick={() => setOpenDropdown(openDropdown === 'student' ? null : 'student')}
                                aria-haspopup="true"
                                aria-expanded={openDropdown === 'student'}
                                aria-labelledby="student-label student-dropdown"
                                className="flex items-center h-10 whitespace-nowrap px-4 py-2 text-black bg-teal-100 hover:bg-teal-200 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                type="button"
                            >
                                {selectedStudent ? (
                                    <>
                                        <img
                                            className="w-6 h-6 mr-2 rounded-full"
                                            src={selectedStudent.image}
                                            alt={`Profile picture of ${selectedStudent.name}`}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/images/default-profile.png";
                                            }}
                                        />
                                        <span>{selectedStudent.name}</span>
                                    </>
                                ) : (
                                    <>
                                        Students
                                        <svg
                                            className="w-2.5 h-2.5 ms-3"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 10 6"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 1 4 4 4-4"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {openDropdown === 'student' && (
                                <div
                                    role="menu"
                                    aria-labelledby="student-dropdown-label"
                                    className="z-20 bg-white rounded-lg shadow w-60 absolute mt-2 left-0 dark:bg-gray-700"
                                >
                                    <ul className="max-h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="student-dropdown-label">
                                        {students.map((student) => (
                                            <li key={student.id}>
                                                <button
                                                    onClick={() => handleStudentClick(student)}
                                                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
                                                    role="menuitem"
                                                >
                                                    <img
                                                        className="w-6 h-6 me-2 rounded-full"
                                                        src={student.image}
                                                        alt={`Profile picture of ${student.name}`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/images/default-profile.png";
                                                        }}
                                                    />
                                                    {student.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="mb-4">
                        <label htmlFor="domain-dropdown" className="flex block text-sm font-medium text-gray-700 mb-1">
                            Select Domain:
                        </label>
                        <div className="relative" ref={domainDropdownRef}>
                            <button
                                id="domain-dropdown"
                                onClick={() => setOpenDropdown(openDropdown === 'domain' ? null : 'domain')}
                                aria-haspopup="true"
                                aria-expanded={openDropdown === 'domain'}
                                aria-labelledby="domain-label domain-dropdown"
                                className="flex items-center h-10 whitespace-nowrap px-4 py-2 text-black bg-teal-100 hover:bg-teal-200 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                type="button"
                            >
                                {selectedDomain ? (
                                    <>
                                        {selectedDomain.Icon ? (
                                            <selectedDomain.Icon className="w-6 h-6 mr-2 rounded-full" />
                                        ) : (
                                            <img
                                                className="w-6 h-6 mr-2 rounded-full"
                                                src="/images/default-domain.png"
                                                alt={selectedDomain.name}
                                            />
                                        )}
                                        <span>{selectedDomain.name}</span>
                                    </>
                                ) : (
                                    <>
                                        Domains
                                        <svg
                                            className="w-2.5 h-2.5 ms-3"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 10 6"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 1 4 4 4-4"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {openDropdown === 'domain' && (
                                <div
                                    role="menu"
                                    aria-labelledby="domain-dropdown-label"
                                    className="z-20 bg-white rounded-lg shadow w-60 absolute mt-2 left-0 dark:bg-gray-700"
                                >
                                    <ul className="max-h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="domain-dropdown-label">
                                        {domains.map((domain) => (
                                            <li key={domain.id}>
                                                <button
                                                    onClick={() => handleDomainClick(domain)}
                                                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left text-sm"
                                                    role="menuitem"
                                                >
                                                    {domain.Icon ? (
                                                        <domain.Icon className="h-6 w-6 mr-2 text-gray-500" />
                                                    ) : (
                                                        <img
                                                            className="h-6 w-6 mr-2 rounded-full"
                                                            src="/images/default-domain.png"
                                                            alt={domain.name}
                                                        />
                                                    )}
                                                    {domain.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
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

                    <div className="mb-4">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-lime-100 hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Generate Task
                        </button>
                    </div>
                </div>

                <div className="col-span-9 xl:col-span-9 rounded-lg shadow grid grid-cols-10">
                    <div className="col-span-7 bg-red-100 rounded-lg m-1">

                    </div>
                    <div className="col-span-3 bg-blue-100 rounded-lg m-1">
                        <PassGeneratedTask student_id={44} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Generate;