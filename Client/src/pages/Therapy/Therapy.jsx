import React, { useEffect, useState, useRef } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

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

const Therapy = () => {
    const [axioedData, setAxioedData] = useState({ sessions: [], student_id: null });
    const [openDropdown, setOpenDropdown] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(students[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedTaskIds, setExpandedTaskIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const studentDropdownRef = useRef(null);

    // console.log("Selected Student: ", selectedStudent);

    useEffect(() => {
        document.title = "AI Task Generate | ABA";

        const handleClickOutside = (event) => {
            if (openDropdown === 'student' && studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdown]);

    useEffect(() => {
        axioStudentData(selectedStudent.id);
        axioedData.sessions.forEach(task => {
            console.log('Task ID:', task.id);
        });
    }, [selectedStudent]);

    const toggleExpand = (taskId) => {
        setExpandedTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

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
                setError("Cannot fetch student data");
            })
            .finally(() => setLoading(false));


        /*
        axios.get(`/api/students/${studentId}`)
            .then(response => {
                if (response.data.sessions.length === 0) {
                    setAxioedData({ sessions: [], student_id: response.data.student_id });
                } else {
                    setAxioedData(response.data);
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Cannot fetch student data");
            })
            .finally(() => setLoading(false));
        */
    };

    const handleStudentClick = (student) => {
        setAxioedData({ sessions: [], student_id: student.id });
        setSelectedStudent(student);
        setOpenDropdown(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h6 className="font-mono text-3xl leading-tight text-gray-900 mb-1.5 py-2">Therapy</h6>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 xl:col-span-4">
                    <div className="container flex flex-wrap items-center gap-3 mx-auto px-4 sm:px-6 lg:px-8">
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
                                        <ul className="max-h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200">
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
                            <label htmlFor="add-button" className="flex block text-sm font-medium text-gray-700 mb-1">Add Task:</label>
                            <button
                                id="add-button"
                                className="flex items-center h-10 whitespace-nowrap px-4 py-2 text-black bg-teal-100 hover:bg-teal-200 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                type="button"
                            >
                                Add to db
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="inline-calendar" className="flex block text-sm font-medium text-gray-700 mb-1">
                            Select Date:
                        </label>
                        <div id="inline-calendar" className="bg-white rounded-lg shadow p-4 dark:bg-gray-700">
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                                className="react-calendar"
                                locale="en-US"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-8 xl:col-span-8 rounded-lg shadow p-1">
                    <div className="rounded-lg bg-gray-100 p-1 h-full">
                        {axioedData.sessions.length === 0 ? (
                            <p>No pass generated sessions</p>
                        ) : (
                            <ul className="space-y-2 p-2 text-sm max-h-96 overflow-y-auto">
                                {axioedData.sessions.map(task => {
                                    const isExpanded = expandedTaskIds.includes(task.id);
                                    return (
                                        <li
                                            key={task.id}
                                            className={`border p-4 rounded-md cursor-pointer ${task.trialresult === "+" ? 'bg-green-100' :
                                                task.trialresult === "-" ? 'bg-red-100' :
                                                    task.trialresult === "OT" ? 'bg-yellow-100' :
                                                        'bg-white'
                                                }`}
                                            onClick={() => toggleExpand(task.id)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className='flex'><strong>Task:</strong>&nbsp;{task.task}</p>
                                                    <p className='flex'><strong>Sub-task:</strong>&nbsp;{task.subtask}</p>
                                                    <p className='flex'><strong>Status:</strong>&nbsp;{task.trialresult}</p>
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
                                                <div className="mt-2 text-left">
                                                    <p className='text-left'>{task.description}</p>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded">
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Therapy;