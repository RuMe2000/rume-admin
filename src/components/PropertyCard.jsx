import { useNavigate } from "react-router-dom";
import { getAllProperties } from "../utils/firestoreUtils";
import { useEffect, useState } from "react";

const PropertyCard = () => {
    const [properties, setProperties] = useState([]);

    const navigate = useNavigate();

    const fetchProperties = async () => {
        const props = await getAllProperties();
        setProperties(props);
    };

    useEffect(() => {
        fetchProperties();
    }, []);


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-8">
            {properties.map((property) => (
                <div
                    key={property.id}
                    className="relative h-64 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition duration-300"
                    onClick={() => navigate(`view/${property.id}`)}
                >
                    {/* Background Image */}
                    <img
                        src={property.verificationData.propertyFrontUrl}
                        alt={property.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay for text */}
                    <div className="absolute inset-0 bg-black/10"></div>

                    {/* Top left: property name */}
                    <div className="absolute top-2 left-2 text-white text-xl font-bold px-2 py-1 rounded">
                        {property.name}
                    </div>

                    {/* Top right: property status */}
                    <div className="absolute top-2 right-2 text-white px-2 py-1 rounded-full">
                        <div
                            className={`
                        mr-2 text-center rounded-full p-2 shadow-xl
                        ${property.status === 'verified' ? 'bg-successGreen' : ''}
                        ${property.status === 'pending' ? 'bg-yellow-500' : ''}
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
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#FFFFFF"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" /></svg>
                                )}
                            </h1>
                        </div>
                    </div>

                    {/* Bottom left: owner name */}
                    <div className="absolute bottom-2 left-2 text-white text-lg font-semibold px-2 py-1 rounded">
                        {property.ownerName}
                    </div>
                </div>

            ))}
        </div>
    );
};

export default PropertyCard;
