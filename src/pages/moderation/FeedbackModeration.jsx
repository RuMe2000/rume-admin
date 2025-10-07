import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getFeedbacks,
    approveFeedback,
    rejectFeedback,
    updateFeedback,
} from "../../utils/firestoreUtils";

const FeedbackModeration = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedContent, setEditedContent] = useState("");

    const fetchData = async () => {
        try {
            const data = await getFeedbacks();
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            toast.error("Failed to load feedbacks.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await approveFeedback(id);
            toast.success("Feedback approved.");
            fetchData();
        } catch (error) {
            toast.error("Failed to approve feedback.");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectFeedback(id);
            toast.success("Feedback rejected.");
            fetchData();
        } catch (error) {
            toast.error("Failed to reject feedback.");
        }
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateFeedback(id, editedContent);
            toast.success("Feedback updated!");
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to update feedback.");
        }
    };

    //convert rating to star
    const renderStars = (rating) => {
        const filledStars = Math.round(rating || 0);
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <span
                        key={i}
                        className={`text-3xl ${i < filledStars ? "text-yellow-400" : "text-gray-600"
                            }`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-start text-3xl font-bold mb-6">Feedback Moderation</h1>

            {feedbacks.length === 0 ? (
                <p className="text-center text-white/70">No pending feedbacks.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {feedbacks.map((fb) => (
                        <div
                            key={fb.id}
                            className="bg-blue-950/30 border border-darkGray rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all hover:scale-101 duration-300"
                        >
                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-lg text-mainBlue">
                                        {fb.propertyId ? `Property: ${fb.propertyId}` : "Unknown Property"}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {fb.createdAt
                                            ? new Date(fb.createdAt?.toDate?.() || fb.createdAt).toLocaleString()
                                            : "Unknown date"}
                                    </p>
                                </div>

                                <p className="text-gray-300">Room: {fb.roomId || "N/A"}</p>
                                <p className="text-gray-300">By: {fb.seekerId || "Anonymous User"}</p>

                                {/* ⭐ Rating display */}
                                <div className="flex flex-row items-center aling-center gap-2 mt-2">
                                    <p className="text-sm font-semibold text-gray-300">Rating:</p>
                                    <div>{renderStars(fb.rating)}</div>
                                </div>
                                

                                <div className="mt-1">
                                    <p className="text-sm font-semibold text-gray-300 mb-1">Feedback:</p>
                                    {editingId === fb.id ? (
                                        <textarea
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                            className="w-full p-2 rounded-lg bg-bgBlue border border-hoverBlue text-white focus:outline-none resize-none"
                                        />
                                    ) : (
                                        <p className="text-md text-gray-200">{fb.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons section */}
                            <div className="flex flex-row justify-between items-center mt-3">
                                {/* Left side: Edit / Save */}
                                <div>
                                    {editingId === fb.id ? (
                                        <button
                                            onClick={() => handleSaveEdit(fb.id)}
                                            className="px-4 py-2 rounded-xl bg-successGreen hover:bg-successGreen/80 font-semibold"
                                        >
                                            SAVE
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(fb.id);
                                                setEditedContent(fb.description);
                                            }}
                                            className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 font-semibold"
                                        >
                                            EDIT
                                        </button>
                                    )}
                                </div>

                                {/* Right side: Approve / Reject */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(fb.id)}
                                        className="px-4 py-2 rounded-xl bg-mainBlue hover:bg-hoverBlue font-semibold transition duration-300"
                                    >
                                        APPROVE
                                    </button>

                                    <button
                                        onClick={() => handleReject(fb.id)}
                                        className="px-4 py-2 rounded-xl bg-errorRed hover:bg-errorRed/80 font-semibold transition duration-300"
                                    >
                                        REJECT
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackModeration;