import React, { useRef, useEffect } from "react";

const DomainDropdown = ({
  status,
  selectedStatus,
  setSelectedStatus,
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenDropdown]);

  const handleDomainClick = (status) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700 flex mb-1">Status</label>
      <button
        id="status-dropdown"
        onClick={() =>
          setOpenDropdown(openDropdown === "status" ? null : "status")
        }
        aria-haspopup="true"
        aria-expanded={openDropdown === "status"}
        className="flex items-center justify-between w-full rounded-md border bg-white text-sm text-black shadow-md px-4 py-2"
        type="button"
      >
        <div className="flex items-center gap-1">
          {selectedStatus ? (
            <>

              <span>{selectedStatus.name}</span>
            </>
          ) : (
            <span>Status</span>
          )}
        </div>

        <svg
          className={`w-2.5 h-2.5 ${openDropdown === "status" ? "transform rotate-180" : ""
            }`}
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
      </button>

      {openDropdown === "status" && (
        <div
          role="menu"
          className="z-20 bg-white rounded-lg shadow w-full absolute mt-2 left-0"
        >
          <ul className="max-h-48 py-2 overflow-y-auto text-gray-700">
            {status.map((status) => (
              <li key={status.id}>
                <button
                  onClick={() => handleDomainClick(status)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  {status.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DomainDropdown;