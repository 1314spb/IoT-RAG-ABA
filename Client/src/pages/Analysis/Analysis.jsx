import React, { useEffect } from "react";
import student1 from "../../assets/students/student1.jpg";
import student2 from "../../assets/students/student2.jpg";
import student3 from "../../assets/students/student3.jpg";
import student4 from "../../assets/students/student4.jpg";
import student5 from "../../assets/students/student5.jpg";
import student6 from "../../assets/students/student6.jpg";
import student7 from "../../assets/students/student7.jpg";

const Analysis = () => {
    useEffect(() => {
        document.title = "Analysis | ABA";
    }, []);

    const students = [
        { id: 1, name: "John Doe", phone: "1234567890", image: student1 },
        { id: 2, name: "Mary Jane", phone: "1234567890", image: student2 },
        { id: 3, name: "Peter Parker", phone: "1234567890", image: student3 },
        { id: 4, name: "Tony Stark", phone: "1234567890", image: student4 },
        { id: 5, name: "Bruce Wayne", phone: "1234567890", image: student5 },
        { id: 6, name: "Clark Kent", phone: "1234567890", image: student6 },
        { id: 7, name: "Diana Prince", phone: "1234567890", image: student7 },
    ];

    const handleStudentClick = (student) => {
        console.log(`Clicked on: ${student.name}`);
    };

    return (
        <section className="relative bg-stone-50 object-fill">
            <h6 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5 px-64 py-2">Analysis</h6>
            <div className="w-full py-24 relative z-10 backdrop-blur-3xl">
                <div className="w-full max-w-7xl px-2 lg:px-8">
                    <div className="grid grid-cols-12 gap-8 max-w-4xl xl:max-w-full">
                        <div className="col-span-12 xl:col-span-5">
                            <h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5">-------------------------------</h2>
                            <h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5">Student Choosing List</h2>

                            <ul role="list" className="p-6 divide-y divide-slate-200 max-h-96 overflow-y-auto">
                                {students.map((student) => (
                                    <li key={student.id} className="flex py-4 first:pt-0 last:pb-0">
                                        <button
                                            onClick={() => handleStudentClick(student)}
                                            className="flex items-center w-full text-left focus:outline-none hover:bg-gray-100 p-2 rounded"
                                        >
                                            <img className="h-10 w-10 rounded-full" src={student.image} alt={student.name} />
                                            <div className="ml-3 overflow-hidden">
                                                <p className="text-sm font-medium text-slate-900">{student.name}</p>
                                                <p className="text-sm text-slate-500 truncate">{student.phone}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                        </div>

                        <div className="col-span-12 xl:col-span-7 px-2.5 py-5 sm:p-8 bg-gradient-to-b from-white/25 to-white xl:bg-white rounded-2xl max-xl:row-start-1">
                            
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Analysis;