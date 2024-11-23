import React, { useEffect } from "react";

const Therapy = () => {
    useEffect(() => {
        document.title = "Therapy | ABA";
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Therapy</h1>
            <p className="mt-2 text-gray-600">This is the Therapy page.</p>
        </div>
    );
}

export default Therapy;