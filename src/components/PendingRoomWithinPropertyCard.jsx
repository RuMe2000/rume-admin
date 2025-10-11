import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPropertiesWithPendingOrReverifyRooms } from "../utils/firestoreUtils";

const PendingRoomWithinPropertyCard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getPropertiesWithPendingOrReverifyRooms();
            setProperties(data);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <p className="text-white text-center mt-10">Loading rooms...</p>;
    }

    if (properties.length === 0) {
        return <p className="text-white text-center mt-10">No rooms pending verification.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-8">
            {properties.map((property) => (
                <div
                    key={property.id}
                    className="relative rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 cursor-pointer h-[270px] max-h-[400px]"
                    onClick={() => navigate(`/properties/view/${property.id}`)}
                >
                    {/* Background Image */}
                    <img
                        src={property.verificationData?.propertyFrontUrl}
                        alt={property.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/20"></div>

                    {/* Property Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-5">
                        {/* Header Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{property.name}</h2>
                            <p className="text-white font-semibold mb-2">
                                {property.ownerName || "Unknown"}
                            </p>

                            {/* Property status badge */}
                            <div className="absolute top-5 right-3 text-white px-2 py-1 rounded-full">
                                <div
                                    className={`
                        mr-2 text-center rounded-full px-4 py-1 shadow-xl
                        ${property.status === 'verified' ? 'bg-successGreen' : ''}
                        ${property.status === 'pending' ? 'bg-yellow-500' : ''}
                        ${property.status === 'rejected' ? 'bg-errorRed' : ''}
                        ${property.status !== 'verified' && property.status !== 'pending' && property.status !== 'rejected' ? 'bg-gray-400' : ''}
                    `}
                                >
                                    <h1
                                        title={property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                        className="text-xl text-white italic">
                                        {property.status === 'verified' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" /></svg>
                                        ) : property.status === 'pending' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="m586-486 78-78-56-58-79 79 57 57Zm248 248-88-88-6-70 74-84-74-86 10-112-110-24-58-96-102 44-104-44-37 64-59-59 64-107 136 58 136-58 76 128 144 32-14 148 98 112-98 112 12 130Zm-456 76 102-44 104 44 38-64-148-148-36 36-142-142 56-56 86 84-21 21-203-203 6 68-74 86 74 84-10 114 110 24 58 96ZM344-60l-76-128-144-32 14-148-98-112 98-112-12-130-70-70 56-56 736 736-56 56-112-112-64 108-136-58-136 58Zm185-483Zm-145 79Z" /></svg>
                                        ) : property.status === 'rejected' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" /></svg>
                                        )}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Rooms Section */}
                        <div className="bg-bgBlue/60 p-3 h-[180px] rounded-xl mt-3">
                            {/* <h3 className="text-white font-semibold mb-2">
                                Rooms needing verification:
                            </h3> */}
                            <div
                                className={`flex flex-col gap-2 pr-2 ${property.rooms && property.rooms.length > 2
                                        ? 'overflow-y-auto h-[130px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'
                                        : ''
                                    }`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {Array.isArray(property.rooms) && property.rooms.length > 0 ? (
                                    property.rooms.map((room) => (
                                        <div key={room.id} className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
                                            <p className="text-white text-sm">{room.name || "Unnamed Room"}</p>
                                            <span
                                                className={`text-sm capitalize font-semibold w-20 text-center py-1 rounded-full
                          ${room.verificationStatus === "pending" ? "bg-yellow-500 text-white" : ""}
                          ${room.verificationStatus === "reverify" ? "bg-orange-500 text-white" : ""}
                          ${room.verificationStatus === "verified" ? "bg-successGreen text-white" : ""}
                        `}
                                            >
                                                {room.verificationStatus || "unknown"}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-white text-sm italic">No rooms requiring verification.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PendingRoomWithinPropertyCard;
