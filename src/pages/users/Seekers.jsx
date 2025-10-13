import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getAllSeekers } from "../../utils/firestoreUtils";
import UserCard from "./UserCard";

const Seekers = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [seekers, setSeekers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSeekers = async () => {
        setIsLoading(true);
        const data = await getAllSeekers();
        setSeekers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSeekers();
    }, []);

    // Filtered seekers list
    const filteredSeekers = useMemo(() => {
        let result = [...seekers];

        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter(
                (s) => s.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Search by name or email
        if (searchTerm.trim()) {
            result = result.filter((s) => {
                const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
                return (
                    fullName.includes(searchTerm.toLowerCase()) ||
                    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        // Sort newest first
        result.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
        });

        return result;
    }, [seekers, statusFilter, searchTerm]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-row items-center text-white gap-3">
                <button
                    onClick={() => navigate("/users")}
                    className="cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="30px"
                        viewBox="0 -960 960 960"
                        width="30px"
                        fill="#FFFFFF"
                    >
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
                </button>
                <h1 className="text-3xl font-bold">Seekers</h1>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col absolute top-10 right-10 sm:flex-row sm:items-center sm:justify-end gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-darkBlue text-white px-4 py-2 rounded-xl border border-gray-600 w-full sm:w-60 focus:outline-none"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-darkBlue text-white px-3 py-2 rounded-xl border border-gray-600 focus:outline-none"
                >
                    <option value="all">All</option>
                    <option value="searching">Searching</option>
                    <option value="booked">Booked</option>
                </select>
            </div>

            {/* Table */}
            <div className="relative mt-6">
                <div className="overflow-auto max-h-[82vh] rounded-2xl">
                    <table className="min-w-full text-white rounded-md">
                        <thead className="sticky top-0 bg-darkBlue z-10">
                            <tr className="text-gray-300">
                                <th className="px-4 py-2 border-b border-gray-600 text-center">Status</th>
                                <th className="px-4 py-2 border-b border-gray-600 text-center">Name</th>
                                <th className="px-4 py-2 border-b border-gray-600 text-center">Email</th>
                                <th className="px-4 py-2 border-b border-gray-600 text-center">User ID</th>
                                <th className="px-4 py-2 border-b border-gray-600 text-center">Joined On</th>
                                <th className="px-4 py-2 border-b border-gray-600 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-400">
                                        Loading seekers...
                                    </td>
                                </tr>
                            ) : filteredSeekers.length > 0 ? (
                                filteredSeekers.map((seeker) => (
                                    <tr
                                        key={seeker.id}
                                        className="text-center border-b border-gray-700 hover:bg-darkBlue/50 transition"
                                    >
                                        <td className="px-2 py-2">
                                            <span
                                                className={`inline-flex items-center justify-center w-24 h-7 rounded-full text-sm font-semibold
                                                    ${seeker.status === "searching" ? "bg-yellow-500 text-white" : ""}
                                                    ${seeker.status === "booked" ? "bg-successGreen text-white" : ""}
                                                    ${!["searching", "booked"].includes(seeker.status) ? "bg-gray-500 text-white" : ""}`}
                                            >
                                                {seeker.status
                                                    ? seeker.status.charAt(0).toUpperCase() + seeker.status.slice(1)
                                                    : "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {seeker?.firstName || seeker?.lastName
                                                ? `${seeker.firstName?.charAt(0).toUpperCase() + seeker.firstName?.slice(1)} ${seeker.lastName?.charAt(0).toUpperCase() + seeker.lastName?.slice(1)}`
                                                : "Unknown"}
                                        </td>
                                        <td className="px-4 py-2">{seeker.email || "Unknown"}</td>
                                        <td className="px-4 py-2 relative group cursor-pointer transition-all duration-200">
                                            <span className="group-hover:hidden">
                                                {seeker.id.substring(0, 12)}...
                                            </span>
                                            <span className="hidden group-hover:inline-block transition-all duration-200">
                                                {seeker.id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {seeker.createdAt
                                                ? new Date(seeker.createdAt.seconds * 1000).toLocaleDateString()
                                                : "Unknown"}
                                        </td>
                                        <td className="px-4 py-2 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedUserId(seeker.id)}
                                                className="bg-transparent px-3 py-1 rounded-2xl hover:scale-110 duration-300 transition"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    height="24px"
                                                    viewBox="0 -960 960 960"
                                                    width="24px"
                                                    fill="#FFFFFF"
                                                >
                                                    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-400">
                                        No seekers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUserId && (
                <UserCard
                    userId={selectedUserId}
                    role="seeker"
                    onClose={() => {
                        setSelectedUserId(null);
                        fetchSeekers(); // refresh list after changes
                    }}
                />
            )}
        </div>
    );
};

export default Seekers;
