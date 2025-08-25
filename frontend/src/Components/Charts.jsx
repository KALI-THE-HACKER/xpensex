import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js/auto";

Chart.register(...registerables);

export function MonthChart({ data }) {
    const chartRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chartInstance, setChartInstance] = useState(null);
    const [monthDatasets, setMonthDatasets] = useState([]); // renamed for clarity
    const [monthLabels, setMonthLabels] = useState([]);

    const colors = [
        "#845EC2",  // Neon Purple
        "#FF6B81",  // Neon Pink
        "#2C73D2",  // Strong Blue
        "#6BCB77",  // Fresh Green
        "#9B6DFF",  // Bright Violet
        "#FF4D6D",  // Hot Pink
        "#4D96FF",  // Sky Blue
        "#00FFAB",  // Neon Green
        "#B39CD0",  // Light Lavender
        "#FF85B3",  // Light Pink Glow
        "#00C9A7",  // Aqua Green
        "#FFD93D",  // Bright Gold
        "#DDB6F2",  // Soft Lilac
        "#FF8C42",  // Vibrant Orange
        "#6A4C93",  // Deep Violet
        "#F9F871",  // Neon Yellow
        "#A66DD4",  // Electric Purple
        "#A3E4DB",  // Mint Aqua
        "#C77DFF",  // Glow Violet
        "#E4C1F9"   // Pastel Purple
    ];


    useEffect(() => {
        setIsLoading(true);
        if (data) {
            setMonthLabels(data.labels);
            setMonthDatasets([
                {
                    label: "Expenses (₹)",
                    data: data.data,
                    backgroundColor: colors 
                }
            ]);
            setIsLoading(false);
        }
    }, [data]);

    useEffect(() => {
        if (!isLoading && chartRef.current) {
            const ctx = chartRef.current.getContext("2d");

            // Set explicit canvas dimensions
            const container = chartRef.current.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                chartRef.current.width = rect.width;
                chartRef.current.height = rect.height;
            }

            const myChart = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: monthLabels,
                    datasets: monthDatasets, // always an array
                },
                options: { 
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                },
            });

            setChartInstance(myChart);

            return () => {
                if (myChart) {
                    myChart.destroy();
                }
            };
        }
    }, [isLoading, monthLabels, monthDatasets]);

    const containerClasses = "bg-[#191428] md:w-[25vw] h-64 md:h-80 my-3 py-3 px-5 rounded-2xl min-w-0 flex-shrink-0";

    if (isLoading) {
        return (
            <div className={`${containerClasses} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-slate-400 text-sm">Loading expense data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            {(!monthDatasets[0]?.data || monthDatasets[0].data.length === 0) ? (
                <div className="text-center py-8 flex-1 flex items-center justify-center h-full">
                    <div>
                        <p className="text-slate-400 mb-2">No expense data available</p>
                        <p className="text-slate-500 text-sm">Create your first expense transaction to start tracking</p>
                    </div>
                </div>
            ) : (
                <canvas 
                    ref={chartRef} 
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                ></canvas>
            )}
        </div>
    );
};

export function FullChart({ data, period }) {
    const chartRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chartInstance, setChartInstance] = useState(null);
    const [incomeDatasets, setIncomeDatasets] = useState([]);
    const [incomeDataPeriod, setIncomeDataPeriod] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        if (data) {
            setIncomeDatasets(data);
            setIncomeDataPeriod(period);
            setIsLoading(false);
        }
    }, [data, period]);

    useEffect(() => {
        if (!isLoading && chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            
            // Set explicit canvas dimensions
            const container = chartRef.current.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                chartRef.current.width = rect.width;
                chartRef.current.height = rect.height;
            }
    
            const myChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: incomeDataPeriod,
                    datasets: incomeDatasets, // <-- pass as array
                },
                options: { 
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    },
                    plugins: {
                        legend: {
                            position: "top",
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                        },
                    },
                },
            });
    
            setChartInstance(myChart);
    
            return () => {
                if (myChart) {
                    myChart.destroy();
                }
            };
        }
    }, [isLoading, incomeDatasets, incomeDataPeriod]); // <-- depend on both
    
    const containerClasses = "bg-[#191428] md:w-[25vw] h-64 md:h-80 my-3 py-3 px-5 rounded-2xl min-w-0 flex-shrink-0";
    
    if (isLoading) {
        return (
            <div className={`${containerClasses} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-slate-400 text-sm">Loading Income data...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={containerClasses}>
            {(!incomeDatasets[0]?.data || incomeDatasets[0].data.length === 0) ? (
                 <div className="text-center py-8 flex-1 flex items-center justify-center h-full">
                    <div>
                        <p className="text-slate-400 mb-2">No income date available</p>
                        <p className="text-slate-500 text-sm">Add your income to start tracking</p>
                    </div>
                </div>
            ) : (
                <canvas 
                    ref={chartRef} 
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                ></canvas>
            )}
        </div>)
};