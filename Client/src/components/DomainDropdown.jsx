import React, { useRef, useEffect } from "react";

const DomainDropdown = ({
  domains,
  selectedDomain,
  setSelectedDomain,
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

  const handleDomainClick = (domain) => {
    setSelectedDomain(domain);
    setOpenDropdown(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700 flex mb-1">Domain</label>
      <button
        id="domain-dropdown"
        onClick={() =>
          setOpenDropdown(openDropdown === "domain" ? null : "domain")
        }
        aria-haspopup="true"
        aria-expanded={openDropdown === "domain"}
        className="flex items-center gap-1 w-full rounded-md border bg-white text-sm text-black shadow-md px-4 py-2"
        type="button"
      >
        {selectedDomain ? (
          <>
            <selectedDomain.Icon className="w-6 h-6" />
            <span>{selectedDomain.name}</span>
            <svg
              className={`w-2.5 h-2.5 ${
                openDropdown === "domain" ? "transform rotate-180" : ""
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
          </>
        ) : (
          <>
            Domain
            <svg
              className={`w-2.5 h-2.5 ${
                openDropdown === "domain" ? "transform rotate-180" : ""
              } ml-3`}
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

      {openDropdown === "domain" && (
        <div
          role="menu"
          className="z-20 bg-white rounded-lg shadow w-full absolute mt-2 left-0"
        >
          <ul className="max-h-48 py-2 overflow-y-auto text-gray-700">
            {domains.map((domain) => (
              <li key={domain.id}>
                <button
                  onClick={() => handleDomainClick(domain)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  <domain.Icon className="w-6 h-6 mr-2" />
                  {domain.name}
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