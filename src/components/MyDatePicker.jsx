import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const MyDatePicker = ({ value, onChange, placeholder = "Pick a date" }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className="flex items-center gap-2 bg-hoverBlue text-white px-3 py-1 rounded-full border border-gray-600 focus:outline-none"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <span className="text-sm">
                    {value ? new Date(value).toLocaleDateString() : placeholder}
                </span>
            </button>

            {showCalendar && (
                <div className="absolute mt-2 z-50">
                    <DayPicker
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={(date) => {
                            if (date) {
                                onChange(date.toISOString());
                                setShowCalendar(false);
                            }
                        }}
                        classNames={{
                            root: "bg-mainBlue text-white rounded-lg shadow-lg p-4 text-lg w-96", // <-- bigger
                            caption: "mb-4 flex justify-center text-xl font-semibold",
                            head: "text-white",
                            head_row: "text-center",
                            nav_button: "text-white hover:bg-white/20 rounded p-2",
                            week: "grid grid-cols-7 gap-2",
                            day: "text-white hover:bg-white/20 rounded-full py-3", // <-- bigger cells
                            day_selected: "bg-errorRed text-white rounded-full py-3",
                            day_today: "underline",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default MyDatePicker;
