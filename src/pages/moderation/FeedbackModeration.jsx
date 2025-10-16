import { useNavigate } from "react-router-dom";
import { getAllProperties } from "../../utils/firestoreUtils";
import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const FeedbackModeration = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [feedbackStats, setFeedbackStats] = useState({});
    const [viewedProperties, setViewedProperties] = useState(() => {
        const stored = localStorage.getItem("viewedProperties");
        return stored ? JSON.parse(stored) : {};
    });

    const navigate = useNavigate();

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const props = await getAllProperties();
            setProperties(props);
            await fetchFeedbackStats(props);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch total & recent feedbacks for each property
    const fetchFeedbackStats = async (props) => {
        const stats = {};
        const now = new Date();
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        try {
            await Promise.all(
                props.map(async (property) => {
                    const feedbackRef = collection(db, "feedbacks");
                    const q = query(feedbackRef, where("propertyId", "==", property.id));
                    const snapshot = await getDocs(q);

                    let total = 0;
                    let recent = 0;

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        total++;
                        const feedbackDate = data.createdAt?.toDate?.();
                        if (feedbackDate && feedbackDate >= fourteenDaysAgo) {
                            recent++;
                        }
                    });

                    // If admin already viewed it, clear recent count
                    const viewed = viewedProperties[property.id];
                    stats[property.id] = {
                        total,
                        recent: viewed ? 0 : recent,
                    };
                })
            );

            setFeedbackStats(stats);
        } catch (error) {
            console.error("Error fetching feedback stats:", error);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // ✅ Handle card click — mark property as viewed & reset recent feedbacks
    const handlePropertyClick = (id) => {
        setViewedProperties((prev) => {
            const updated = { ...prev, [id]: true };
            localStorage.setItem("viewedProperties", JSON.stringify(updated));
            return updated;
        });

        setFeedbackStats((prev) => ({
            ...prev,
            [id]: { ...prev[id], recent: 0 },
        }));

        navigate(`/feedback/${id}`);
    };

    // ✅ Filter by property or owner name
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
                    {filteredProperties.map((property) => {
                        const feedback = feedbackStats[property.id] || { total: 0, recent: 0 };
                        const hasRecent = feedback.recent > 0;

                        return (
                            <div
                                key={property.id}
                                onClick={() => handlePropertyClick(property.id)}
                                className={`relative bg-blue-950/40 rounded-2xl p-4 shadow-lg border ${
                                    hasRecent ? "border-green-500" : "border-darkGray"
                                } hover:scale-105 transition duration-300 cursor-pointer`}
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

                                <div className="mt-3 text-sm text-gray-300 space-y-1">
                                    <p>Total Feedbacks: {feedback.total}</p>
                                    <p
                                        className={
                                            hasRecent
                                                ? "text-green-400 font-medium"
                                                : "text-gray-400"
                                        }
                                    >
                                        Recent Feedbacks: {feedback.recent}
                                    </p>
                                </div>

                                {hasRecent && (
                                    <div className="absolute top-3 right-3 bg-green-600 text-xs px-2 py-1 rounded-lg font-semibold">
                                        New
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FeedbackModeration;
