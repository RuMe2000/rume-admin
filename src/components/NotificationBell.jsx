import { useEffect, useState, useRef } from "react";
import {
    listenForPendingPropertiesWithOwners,
    listenForPendingOrReverifyRooms, // ✅ updated import
} from "../utils/firestoreUtils";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
    const [pendingProps, setPendingProps] = useState([]);
    const [pendingRooms, setPendingRooms] = useState([]); // ✅ renamed from pendingRoomRequests
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Subscribe to pending properties
    useEffect(() => {
        const unsubscribe = listenForPendingPropertiesWithOwners((pending) => {
            setPendingProps(pending);
        });
        return () => unsubscribe();
    }, []);

    // ✅ Subscribe to pending & reverify rooms (real-time)
    useEffect(() => {
        const unsubscribe = listenForPendingOrReverifyRooms((rooms) => {
            setPendingRooms(rooms);
        });
        return () => unsubscribe();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Total notifications (sum of properties + rooms)
    const totalNotifications = pendingProps.length + pendingRooms.length;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <div
                className="relative cursor-pointer hover:scale-110 transition duration-200"
                onClick={() => setOpen(!open)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#FFFFFF"
                >
                    <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                </svg>

                {/* Badge */}
                {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-sm font-bold px-1.5 rounded-full">
                        {totalNotifications}
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-bgBlue rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 pb-1 font-semibold text-white">
                        Notifications
                    </div>
                    <ul className="divide-y divide-darkGray">
                        {/* Pending Properties */}
                        {pendingProps.map((prop) => (
                            <li
                                key={`prop-${prop.id}`}
                                className="p-3 hover:bg-white/10 cursor-pointer transition duration-200"
                                onClick={() => navigate(`/properties/view/${prop.id}`)}
                            >
                                <p className="text-sm text-yellow-500 text-right italic">
                                    Pending property verification
                                </p>
                                <p className="font-medium text-white">
                                    {prop.name || "Unnamed Property"}
                                </p>
                                <p className="text-sm text-white">
                                    Owner: {prop.ownerName || "Unknown"}
                                </p>
                            </li>
                        ))}

                        {/* ✅ Pending or Reverify Rooms */}
                        {pendingRooms.map((room) => (
                            <li
                                key={`room-${room.roomId}`}
                                className="p-3 hover:bg-white/10 cursor-pointer transition duration-200"
                                onClick={() => navigate(`/properties/view/${room.propertyId}`)}
                            >
                                <p className="text-sm text-yellow-500 text-right italic">
                                    {room.verificationStatus === "reverify"
                                        ? "Room re-verification required"
                                        : "Pending room verification"}
                                </p>
                                <p className="font-medium text-white">
                                    {room.name || "Unnamed Room"}
                                </p>
                                <p className="text-sm text-white">
                                    Property: {room.propertyName || "Unknown Property"}
                                </p>
                            </li>
                        ))}

                        {/* Empty state */}
                        {totalNotifications === 0 && (
                            <li className="p-3 text-sm text-gray-500">
                                No pending requests
                            </li>
                        )}
                    </ul>
                    <div
                        className="p-2 text-center text-white hover:underline cursor-pointer border-t border-darkGray"
                        onClick={() => navigate("/properties")}
                    >
                        View All Properties
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
