import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';

import Datepicker from "react-tailwindcss-datepicker";

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
import student7 from "../../assets/students/student7.jpg";

const History = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState(null);

    const [selectedDate, setSelectedDate] = useState({ startDate: null, endDate: null });
    const dropdownRef = useRef(null);

    const students = [
        { id: 41, name: "John Doe", phone: "1234567890", image: student1 },
        { id: 42, name: "Mary Jane", phone: "1234567890", image: student2 },
        { id: 43, name: "Peter Parker", phone: "1234567890", image: student3 },
        { id: 44, name: "Tony Stark", phone: "1234567890", image: student4 },
        { id: 45, name: "Bruce Wayne", phone: "1234567890", image: student5 },
        { id: 46, name: "Clark Kent", phone: "1234567890", image: student6 },
        { id: 47, name: "Diana Prince", phone: "1234567890", image: student7 },
    ];

    const domains = [
        { id: 1, name: "Academic and Learning", Icon: Domain1 },
        { id: 2, name: "Social Emotion", Icon: Domain2 },
        { id: 3, name: "Communication", Icon: Domain3 },
        { id: 4, name: "Sensory Motor Skill", Icon: Domain4 },
        { id: 5, name: "Independent and Self-help", Icon: Domain5 },
        { id: 6, name: "Behavioural Development", Icon: Domain6 },
    ];

    useEffect(() => {
        document.title = "History - ABA";

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleUserClick = (student) => {
        console.log(`Clicked on: ${student.name}`);
        setSelectedStudent(student);

        axios.get(`/api/students/${student.id}`)
            .then(response => console.log(response.data))
            .catch(error => console.error("Axio error: ", error));
        
        setDropdownOpen(false);
    };

    const handleDomainClick = (domain) => {
        console.log(`Clicked on: ${domain.name}`);
        setSelectedDomain(domain);
        setDropdownOpen(false);
    };

    const handleDateChange = (newValue) => {
        console.log("Selected dates:", newValue);
        setSelectedDate(newValue);
    };

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h6 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5 py-2">Student History</h6>

            <div className="bg-red-100 p-4 rounded-md flex justify-start items-center gap-x-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
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

                    {dropdownOpen && (
                        <div
                            role="menu"
                            aria-labelledby="dropdownUsersButton"
                            className="z-20 bg-white rounded-lg shadow w-60 absolute mt-2 left-0 dark:bg-gray-700"
                        >
                            <ul className="max-h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton">
                                {students.map((student) => (
                                    <li key={student.id}>
                                        <button
                                            onClick={() => handleUserClick(student)}
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
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

                <div className="relative">
                    <Datepicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        primaryColor={"teal"}
                        containerClassName="w-72"
                        inputClassName="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 xl:col-span-3">
                    <h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5 pt-5 w-72">Domains</h2>
                    <ul role="list" className="p-6 divide-y divide-slate-200 max-h-96 overflow-y-auto">
                        {domains.map((domain) => (
                            <li key={domain.id} className="flex py-4 first:pt-0 last:pb-0">
                                <button
                                    onClick={() => handleDomainClick(domain)}
                                    className="flex items-center w-full text-left focus:outline-none hover:bg-gray-100 p-2 rounded"
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

                <div className="col-span-12 xl:col-span-9 pt-5">
                    {selectedDomain ? (
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-2xl font-semibold mb-4">{selectedDomain.name}</h3>
                            <p>這裡顯示 {selectedDomain.name} 的詳細信息。</p>
                        </div>
                    ) : (
                        <div className="p-6 bg-white rounded-lg shadow">
                            <p>請選擇一個域來查看詳細信息。</p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default History;