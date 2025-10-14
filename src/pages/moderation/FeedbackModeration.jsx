import { useNavigate } from "react-router-dom";
import { getAllProperties } from "../../utils/firestoreUtils";
import { useEffect, useState, useMemo } from "react";

const FeedbackModeration = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const props = await getAllProperties();
            setProperties(props);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // ✅ Filter by property name or owner name
    const filteredProperties = useMemo(() => {
        if (!searchTerm.trim()) return properties;

        const lower = searchTerm.toLowerCase();
        return properties.filter(
            (p) =>
                p.name?.toLowerCase().includes(lower) ||
                p.ownerName?.toLowerCase().includes(lower)
        );
    }, [properties, searchTerm]);

    return (
        <div className="p-6 text-white">
            
            <div className="flex flex-row items-center justify-between text-white gap-3 mb-6">
                <h1 className="text-3xl font-bold">Feedback Moderation</h1>

                <div className="flex justify-end">
                    <input
                        type="text"
                        placeholder="Search by property or owner name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-darkBlue text-white px-4 py-2 rounded-xl border border-gray-600 w-72 focus:outline-none"
                    />
                </div>
            </div>

            
            {loading ? (
                <p className="text-center text-gray-300 mt-10">Loading properties...</p>
            ) : filteredProperties.length === 0 ? (
                <p className="text-center text-gray-300 mt-10">No properties found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {filteredProperties.map((property) => (
                        <div
                            key={property.id}
                            onClick={() => navigate(`/feedback/${property.id}`)}
                            className="relative bg-blue-950/40 rounded-2xl p-4 shadow-lg border border-darkGray hover:scale-105 transition duration-300 cursor-pointer"
                        >
                            <img
                                src={property.verificationData?.propertyFrontUrl}
                                alt={property.name}
                                className="h-40 w-full object-cover rounded-xl mb-3"
                            />
                            <h2 className="text-xl font-semibold">{property.name}</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {property.ownerName || "No owner info"}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackModeration;
