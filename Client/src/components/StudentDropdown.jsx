import React, { useRef, useEffect } from "react";

const StudentDropdown = ({
  students,
  selectedStudent,
  setSelectedStudent,
  openDropdown,
  setOpenDropdown,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenDropdown]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setOpenDropdown(null);
  };

  return (
    <div className="mb-4">
      <label htmlFor="student-dropdown" className="block text-sm font-medium text-gray-700 mb-1 flex">
        Select Student:
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          id="student-dropdown"
          onClick={() =>
            setOpenDropdown(openDropdown === "student" ? null : "student")
          }
          aria-haspopup="true"
          aria-expanded={openDropdown === "student"}
          className="flex items-center h-10 px-4 py-2 text-black bg-gray-100 hover:bg-gray-200 rounded-lg"
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
                className="w-2.5 h-2.5 ml-3"
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

        {openDropdown === "student" && (
          <div
            role="menu"
            className="z-20 bg-white rounded-lg shadow w-60 absolute mt-2 left-0"
          >
            <ul className="max-h-48 py-2 overflow-y-auto text-gray-700">
              {students.map((student) => (
                <li key={student.id}>
                  <button
                    onClick={() => handleStudentClick(student)}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <img
                      className="w-6 h-6 mr-2 rounded-full"
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
  );
};

export default StudentDropdown;