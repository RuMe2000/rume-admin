import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getFeedbacksByProperty, toggleFeedbackVisibility } from "../../utils/firestoreUtils";
import useAlerts from "../../hooks/useAlerts";
import AlertContainer from "../../components/AlertContainer";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const PropertyFeedbacks = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [propertyName, setPropertyName] = useState("");

    const { alerts, showAlert, removeAlert } = useAlerts();

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            // Get all feedbacks for the property
            const data = await getFeedbacksByProperty(propertyId);

            if (data.length > 0) {
                setPropertyName(data[0].propertyName || "Property");
            }

            // Sort by latest date (DESC)
            const sortedByDate = [...data].sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB - dateA;
            });

            // Fetch user info for each feedback
            const withUserInfo = await Promise.all(
                sortedByDate.map(async (fb) => {
                    try {
                        if (!fb.seekerId) return fb; // skip if no seekerId
                        const userDoc = await getDoc(doc(db, "users", fb.seekerId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            return {
                                ...fb,
                                userName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching user for feedback ${fb.id}:`, error);
                    }
                    return fb;
                })
            );

            // Update state
            setFeedbacks(withUserInfo);
        } catch (error) {
            showAlert("error", "Failed to load feedbacks.");
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [propertyId]);

    const handleToggleVisibility = async (id, currentHidden) => {
        try {
            await toggleFeedbackVisibility(id, !currentHidden);
            showAlert(
                "success",
                currentHidden ? "Feedback is now visible." : "Feedback has been hidden."
            );
            fetchFeedbacks();
        } catch (error) {
            showAlert("error", "Failed to update feedback visibility.");
            console.error("Error toggling feedback visibility:", error);
        }
    };

    const renderStars = (rating) => {
        const filled = Math.round(rating || 0);
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < filled ? "text-yellow-400" : "text-gray-600"}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // ✅ Recent feedbacks (latest 5)
    const recentFeedbacks = useMemo(() => feedbacks.slice(0, 5), [feedbacks]);

    // ✅ Group feedbacks by roomName (still sorted by latest)
    const groupedFeedbacks = useMemo(() => {
        const groups = {};
        feedbacks.forEach((fb) => {
            const room = fb.roomName || "Unspecified Room";
            if (!groups[room]) groups[room] = [];
            groups[room].push(fb);
        });
        return groups;
    }, [feedbacks]);

    return (
        <div className="p-6 text-white">
            {/* Header */}
            <div className="flex flex-row gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF">
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
                </button>
                <h1 className="text-3xl font-bold">{propertyName} Feedbacks</h1>
            </div>

            {/* Loading / Empty States */}
            {loading ? (
                <p className="text-white text-center">Loading feedbacks...</p>
            ) : feedbacks.length === 0 ? (
                <p className="text-white text-center">No feedbacks for this property.</p>
            ) : (
                <div className="flex flex-col gap-10">
                    {/* Recent Feedbacks Section */}
                    <div className="p-6 border border-mainBlue rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-white">Recent Feedbacks</h2>
                        <div className="flex flex-col gap-4">
                            {recentFeedbacks.map((fb) => (
                                <div
                                    key={fb.id}
                                    className={`p-5 rounded-2xl border transition-all ${fb.hidden
                                        ? "border-gray-600 bg-bgBlue opacity-60"
                                        : "border-mainBlue bg-bgBlue"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {fb.roomName || "Unspecified Room"}
                                            </h3>
                                            <div>
                                                {renderStars(fb.rating)}
                                                <p className="mt-2 text-gray-200">{fb.description}</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {fb.userName && (
                                                        <span className="font-medium text-white mr-2">
                                                            {fb.userName}
                                                        </span>
                                                    )}
                                                    {fb.createdAt
                                                        ? new Date(fb.createdAt?.toDate?.() || fb.createdAt).toLocaleString()
                                                        : ""}
                                                </p>
                                            </div>

                                        </div>

                                        <button
                                            onClick={() => handleToggleVisibility(fb.id, fb.hidden)}
                                            className={`px-3 py-1 rounded-md text-sm font-semibold transition duration-200 ${fb.hidden
                                                ? "bg-green-600 hover:bg-green-500"
                                                : "bg-errorRed hover:bg-errorRed/80"
                                                }`}
                                        >
                                            {fb.hidden ? "Unhide" : "Hide"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ✅ Grouped Feedbacks by Room */}
                    {Object.entries(groupedFeedbacks).map(([roomName, roomFeedbacks]) => (
                        <div key={roomName} className="p-6 border border-mainBlue rounded-3xl">
                            <h2 className="text-2xl font-semibold mb-3 text-white">
                                {roomName}
                            </h2>

                            <div className="flex flex-col gap-4">
                                {roomFeedbacks.map((fb) => (
                                    <div
                                        key={fb.id}
                                        className={`p-5 rounded-2xl border transition-all ${fb.hidden
                                            ? "border-gray-600 bg-bgBlue opacity-60"
                                            : "border-mainBlue bg-bgBlue"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {renderStars(fb.rating)}
                                                <p className="mt-2 text-gray-200">{fb.description}</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {fb.userName && (
                                                        <span className="font-medium text-white mr-2">
                                                            {fb.userName}
                                                        </span>
                                                    )}
                                                    {fb.createdAt
                                                        ? new Date(fb.createdAt?.toDate?.() || fb.createdAt).toLocaleString()
                                                        : ""}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleVisibility(fb.id, fb.hidden)}
                                                className={`px-3 py-1 rounded-md text-sm font-semibold transition duration-200 ${fb.hidden
                                                    ? "bg-green-600 hover:bg-green-500"
                                                    : "bg-errorRed hover:bg-errorRed/80"
                                                    }`}
                                            >
                                                {fb.hidden ? "Unhide" : "Hide"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertContainer alerts={alerts} removeAlert={removeAlert} />
        </div>
    );
};

export default PropertyFeedbacks;
