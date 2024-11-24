import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DataChart = ({ dataArray }) => {
    const availableFields = [
        { key: 'noof_positive', label: 'Number of positive' },
        { key: 'noof_negative', label: 'Number of negative' },
        { key: 'noofOT', label: 'Number of OT' },
        { key: 'noofP', label: 'Number of P' },
        { key: 'noofUndo', label: 'Number of Undo' },
        { key: 'acceleration', label: 'Acceleration' },
        { key: 'bvp', label: 'BVP' },
        { key: 'temperature', label: 'Temperature' },
    ];

    const [selectedFields, setSelectedFields] = useState(
        availableFields.reduce((acc, field) => {
            acc[field.key] = true;
            return acc;
        }, {})
    );

    const handleCheckboxChange = (key) => {
        setSelectedFields((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const sortedData = [...dataArray].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const labels = sortedData.map((item) => item.date);

    const datasets = availableFields
        .filter((field) => selectedFields[field.key])
        .map((field, index) => ({
            label: field.label,
            data: sortedData.map((item) => item[field.key]),
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            borderWidth: 1,
            backgroundColor: `hsla(${(index * 60) % 360}, 70%, 50%, 0.5)`,
            yAxisID: 'y',
        }));

    const chartData = {
        labels,
        datasets,
    };

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'Data Chart',
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
        },
    };

    return (
        <div>
            <div className="mb-4">
                {availableFields.map((field) => (
                    <label key={field.key} className="inline-flex items-center mr-4">
                        <input
                            type="checkbox"
                            checked={selectedFields[field.key]}
                            onChange={() => handleCheckboxChange(field.key)}
                            className="form-checkbox h-5 w-5 text-teal-600"
                        />
                        <span className="ml-2 text-gray-700">{field.label}</span>
                    </label>
                ))}
            </div>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default DataChart;