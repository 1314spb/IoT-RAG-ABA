import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { Dropdown } from "flowbite-react";

import CalendarPicker from "../../components/CalendarPicker";
import { students } from "../../demoData/studentsData";

const Therapy = () => {
    const navigate = useNavigate();

    const [axioedData, setAxioedData] = useState({ sessions: [], student_id: null });
    const [openDropdown, setOpenDropdown] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(students[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedTaskIds, setExpandedTaskIds] = useState([]);
    const [editingTaskIds, setEditingTaskIds] = useState([]);

    const [editingData, setEditingData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const studentDropdownRef = useRef(null);

    // console.log("Selected Student: ", selectedStudent);

    const onStatusChange = (taskId, newStatus) => {
        if (editingTaskIds.includes(taskId)) {

            setEditingData((prev) => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    trialresult: newStatus,
                },
            }));
        } else {

            setAxioedData((prevData) => {
                const updatedSessions = prevData.sessions.map((task) =>
                    task.id === taskId ? { ...task, trialresult: newStatus } : task
                );
                return { ...prevData, sessions: updatedSessions };
            });
        }
    };

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
        // axioedData.sessions.forEach(task => {
        //     console.log('Task ID:', task.id);
        // });
    }, [selectedStudent]);

    const toggleExpand = (taskId) => {
        setExpandedTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    const toggleEditing = (taskId) => {
        setEditingTaskIds((prev) => {
            if (prev.includes(taskId)) {

                const newIds = prev.filter((id) => id !== taskId);
                setEditingData((current) => {
                    const newEditingData = { ...current };
                    delete newEditingData[taskId];
                    return newEditingData;
                });
                return newIds;
            } else {
                const task = axioedData.sessions.find((t) => t.id === taskId);
                setEditingData((prevEditingData) => ({
                    ...prevEditingData,
                    [taskId]: { ...task },
                }));
                return [...prev, taskId];
            }
        });
    };

    const updateEditingData = (taskId, field, value) => {
        setEditingData((prev) => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [field]: value,
            },
        }));
    };

    const onSave = (taskId) => {
        const updatedTask = editingData[taskId];
        setAxioedData((prevData) => {
            const updatedSessions = prevData.sessions.map((task) =>
                task.id === taskId ? { ...updatedTask } : task
            );
            return { ...prevData, sessions: updatedSessions };
        });
        setEditingTaskIds((prev) => prev.filter((id) => id !== taskId));
        setEditingData((prev) => {
            const newEditingData = { ...prev };
            delete newEditingData[taskId];
            return newEditingData;
        });
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
                                onClick={() => navigate("/services/add")}
                            >
                                Add to db
                            </button>
                        </div>
                    </div>

                    <CalendarPicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                </div>

                <div className="col-span-8 xl:col-span-8 rounded-lg shadow p-1">
                    <div className="rounded-lg bg-gray-100 p-1 h-full">
                        {axioedData.sessions.length === 0 ? (
                            <p>No pass generated sessions</p>
                        ) : (
                            <ul className="space-y-2 p-2 text-sm max-h-96 overflow-y-auto">
                                {axioedData.sessions.map(task => {
                                    const isExpanded = expandedTaskIds.includes(task.id);
                                    const isEditing = editingTaskIds.includes(task.id);

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

                                                    {!isEditing && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleEditing(task.id);
                                                            }}
                                                            className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {isEditing && (
                                                        <div className="mt-2 border-t pt-2">
                                                            <label htmlFor="edit-task" className="block text-sm font-medium text-gray-700 mb-1">Edit Task:</label>
                                                            <input
                                                                type="text"
                                                                onClick={(e) => e.stopPropagation()}
                                                                defaultValue={task.task}
                                                                onChange={(e) => updateEditingData(task.id, "task", e.target.value)}
                                                                className="w-full mb-2 p-1 border rounded"
                                                                placeholder="Edit Task"
                                                            />

                                                            <label htmlFor="edit-subtask" className="block text-sm font-medium text-gray-700 mb-1">Edit Sub-task:</label>
                                                            <input
                                                                type="text"
                                                                onClick={(e) => e.stopPropagation()}
                                                                defaultValue={task.subtask}
                                                                onChange={(e) => updateEditingData(task.id, "subtask", e.target.value)}
                                                                className="w-full mb-2 p-1 border rounded"
                                                                placeholder="Edit Sub-task"
                                                            />

                                                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Edit Description:</label>
                                                            <textarea
                                                                onClick={(e) => e.stopPropagation()}
                                                                defaultValue={task.description}
                                                                onChange={(e) => updateEditingData(task.id, "description", e.target.value)}
                                                                className="w-full mb-2 p-1 border rounded"
                                                                placeholder="Edit Description"
                                                            />

                                                            <label htmlFor="edit-trialresult" className="block text-sm font-medium text-gray-700 mb-1">Edit Status:</label>

                                                            <div onClick={(e) => e.stopPropagation()} className="mb-4">
                                                                <Dropdown label={editingData[task.id]?.trialresult || task.trialresult} inline={true}>
                                                                    <Dropdown.Item
                                                                        onClick={() => onStatusChange(task.id, "+")}
                                                                        className={`${(editingData[task.id]?.trialresult || task.trialresult) === "+" ? "bg-blue-100 text-black" : ""} rounded-none`}
                                                                    >
                                                                        +
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        onClick={() => onStatusChange(task.id, "-")}
                                                                        className={`${(editingData[task.id]?.trialresult || task.trialresult) === "-" ? "bg-blue-100 text-black" : ""} rounded-none`}
                                                                    >
                                                                        -
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        onClick={() => onStatusChange(task.id, "P")}
                                                                        className={`${(editingData[task.id]?.trialresult || task.trialresult) === "P" ? "bg-blue-100 text-black" : ""} rounded-none`}
                                                                    >
                                                                        P
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        onClick={() => onStatusChange(task.id, "OT")}
                                                                        className={`${(editingData[task.id]?.trialresult || task.trialresult) === "OT" ? "bg-blue-100 text-black" : ""} rounded-none`}
                                                                    >
                                                                        OT
                                                                    </Dropdown.Item>
                                                                </Dropdown>
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onSave(task.id);
                                                                }}
                                                                className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                                                            >
                                                                Save
                                                            </button>

                                                        </div>
                                                    )}

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