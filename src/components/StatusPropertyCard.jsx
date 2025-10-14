import { useNavigate } from "react-router-dom";
import {
    getAllProperties,
    getVerifiedProperties,
    getPendingProperties,
} from "../utils/firestoreUtils";
import { useEffect, useState } from "react";

const StatusPropertyCard = ({ status }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProperties = async () => {
        setLoading(true);
        let props = [];

        if (status === "pending") {
            props = await getPendingProperties();
        } else if (status === "verified") {
            props = await getVerifiedProperties();
        } else {
            props = await getAllProperties();
        }

        setProperties(props);
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, [status]);

    if (loading)
        return <p className="text-center text-white mt-10">Loading properties...</p>;

    if (properties.length === 0)
        return <p className="text-center text-gray-400 mt-10">No properties found.</p>;

    return (
        <div className="p-6 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        onClick={() => navigate(`/properties/view/${property.id}`)}
                        className="relative bg-blue-950/40 rounded-2xl p-4 shadow-lg border border-darkGray hover:scale-105 transition duration-300 cursor-pointer overflow-hidden"
                    >
                        {/* Property Image */}
                        <img
                            src={property.verificationData?.propertyFrontUrl}
                            alt={property.name}
                            className="h-40 w-full object-cover rounded-xl mb-3"
                        />

                        {/* Status Badge (Top Right) */}
                        <div
                            className={`absolute top-3 right-3 text-sm font-semibold px-3 py-1 rounded-full shadow-md capitalize flex items-center gap-1
                                ${property.status === "verified"
                                    ? "bg-successGreen text-white"
                                    : property.status === "pending"
                                        ? "bg-yellow-500 text-white"
                                        : property.status === "rejected"
                                            ? "bg-errorRed text-white"
                                            : "bg-gray-500 text-white"
                                }`}
                        >
                            {property.status === 'verified' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" /></svg>
                            ) : property.status === 'pending' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="m586-486 78-78-56-58-79 79 57 57Zm248 248-88-88-6-70 74-84-74-86 10-112-110-24-58-96-102 44-104-44-37 64-59-59 64-107 136 58 136-58 76 128 144 32-14 148 98 112-98 112 12 130Zm-456 76 102-44 104 44 38-64-148-148-36 36-142-142 56-56 86 84-21 21-203-203 6 68-74 86 74 84-10 114 110 24 58 96ZM344-60l-76-128-144-32 14-148-98-112 98-112-12-130-70-70 56-56 736 736-56 56-112-112-64 108-136-58-136 58Zm185-483Zm-145 79Z" /></svg>
                            ) : property.status === 'rejected' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                            ) : property.status === 'reverify' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="m482-200 114-113-114-113-42 42 43 43q-28 1-54.5-9T381-381q-20-20-30.5-46T340-479q0-17 4.5-34t12.5-33l-44-44q-17 25-25 53t-8 57q0 38 15 75t44 66q29 29 65 43.5t74 15.5l-38 38 42 42Zm165-170q17-25 25-53t8-57q0-38-14.5-75.5T622-622q-29-29-65.5-43T482-679l38-39-42-42-114 113 114 113 42-42-44-44q27 0 55 10.5t48 30.5q20 20 30.5 46t10.5 52q0 17-4.5 34T603-414l44 44ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" /></svg>
                            )}
                        </div>

                        {/* Property Info */}
                        <h2 className="text-xl font-semibold">{property.name}</h2>
                        <p className="text-gray-400 text-sm">
                            {property.ownerName || "No owner info"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusPropertyCard;
