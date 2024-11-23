import React, { useEffect } from "react";

const History = () => {


    useEffect(() => {

        document.title = "History - ABA";

    }, []);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-semibold my-8">History</h1>
            <p className="text-lg">
                ABA is a company that was founded in 2021. We have been providing
                services to our customers for over 1 year. We have a team of
                professionals who are dedicated to providing the best service possible
                to our customers.
            </p>
        </div>
    );
}

export default History;

