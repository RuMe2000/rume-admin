import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import RoomImagesCarousel from "../../components/RoomImagesCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { deleteRoom } from "../../utils/firestoreUtils";
import ConfirmDialog from "../../components/ConfirmDialog";
import useAlerts from "../../hooks/useAlerts";
import AlertContainer from "../../components/AlertContainer";

function AmenitiesSection({ room, propertyId, roomId, setRoom }) {
    const [newAmenity, setNewAmenity] = useState("");
    const roomRef = doc(db, "properties", propertyId, "rooms", roomId);

    const handleAddAmenity = async () => {
        if (!newAmenity.trim()) return;
        try {
            await updateDoc(roomRef, {
                amenities: arrayUnion(newAmenity.trim()),
            });
            setRoom((prev) => ({
                ...prev,
                amenities: [...(prev.amenities || []), newAmenity.trim()],
            }));
            setNewAmenity("");
        } catch (err) {
            console.error("Error adding amenity:", err);
        }
    };

    const handleDeleteAmenity = async (amenity) => {
        try {
            await updateDoc(roomRef, {
                amenities: arrayRemove(amenity),
            });
            setRoom((prev) => ({
                ...prev,
                amenities: prev.amenities.filter((a) => a !== amenity),
            }));
        } catch (err) {
            console.error("Error removing amenity:", err);
        }
    };

    return (
        <div>
            <label className="font-bold text-xl">Amenities</label>
            <div className="flex flex-wrap gap-2">
                {room?.amenities?.length ? (
                    room.amenities.map((amenity, idx) => (
                        <span key={idx} className="mt-1 flex items-center gap-1 px-3 py-1 bg-hoverBlue rounded-full text-white">
                            {amenity}
                            <button
                                onClick={() => handleDeleteAmenity(amenity)}
                                className="ml-1 text-lg text-white hover:scale-130 font-bold transition duration-200"
                                title="Remove"
                            >
                                ×
                            </button>
                        </span>
                    ))
                ) : (
                    <p className="text-gray-400 italic">No amenities listed.</p>
                )}
            </div>

            <div className="flex items-center gap-2 mt-3">
                <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add amenity"
                    className="px-3 py-1 w-40 h-10 rounded-2xl bg-darkGray/30 text-white border-0 border-b-2 border-transparent focus:outline-none focus:border-b-white"
                />
                <button
                    onClick={handleAddAmenity}
                    title="Add"
                    className="px-2 py-2 bg-mainBlue text-white font-bold rounded-xl hover:bg-hoverBlue transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                </button>
            </div>
        </div>
    );
}

export default function ViewRoom() {
    const { propertyId, roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [propertyName, setPropertyName] = useState("");
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const { alerts, showAlert, removeAlert } = useAlerts();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
                const roomSnap = await getDoc(roomRef);
                if (roomSnap.exists()) setRoom({ id: roomSnap.id, ...roomSnap.data() });

                const propertyRef = doc(db, "properties", propertyId);
                const propertySnap = await getDoc(propertyRef);
                if (propertySnap.exists()) setPropertyName(propertySnap.data().name ?? "Unknown Property");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [propertyId, roomId]);

    const handleChange = (field, value) => setRoom((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
        await updateDoc(roomRef, { ...room, updatedAt: new Date() });
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate(`/properties/view/${propertyId}`, { replace: true });
        }, 2000);
    };

    const handleScheduleVerification = async () => {
        if (!selectedDate) return showAlert("warning", "Please select a date first.");
        const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
        await updateDoc(roomRef, {
            verificationSchedule: Timestamp.fromDate(new Date(selectedDate)),
            verificationStatus: "pending",
            updatedAt: new Date(),
        });
        setRoom((prev) => ({
            ...prev,
            verificationSchedule: new Date(selectedDate),
            verificationStatus: "pending",
        }));
        setShowDatePicker(false);
    };

    const handleVerify = async () => {
        const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
        await updateDoc(roomRef, {
            verificationStatus: "verified",
            dateVerified: Timestamp.now(),
            updatedAt: new Date(),
        });
        setRoom((prev) => ({ ...prev, verificationStatus: "verified", dateVerified: new Date() }));
        showAlert("success", "Room verified successfully!");
    };

    const handleUnverify = async () => {
        const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
        await updateDoc(roomRef, {
            verificationStatus: "pending",
            updatedAt: new Date(),
        });
        setRoom((prev) => ({ ...prev, verificationStatus: "pending" }));
        showAlert("info", "Room has been unverified.");
    };

    const handleReject = async () => {
        const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
        await updateDoc(roomRef, {
            verificationStatus: "rejected",
            updatedAt: new Date(),
        });
        setRoom((prev) => ({ ...prev, verificationStatus: "rejected" }));
        showAlert("error", "Room has been rejected.");
    };

    const handleDeleteRoom = async (propertyId, roomId) => {
        try {
            await deleteRoom(propertyId, roomId);
            showAlert("info", "Room has been deleted.");
        } catch (error) {
            console.error('Error deleting room:', error);
            showAlert("error", "Error deleting room")
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading || !room) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-white italic">Loading room details...</p>
            </div>
        );
    }

    return (
        <div className="p-6 text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div className='flex flex-row gap-3'>
                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                    </button>
                    <h1 className='text-3xl font-bold'>{propertyName} – {room.name}</h1>
                </div>

                {/* STATUS BADGE */}
                <div className="flex flex-col gap-3 items-center fixed top-8 right-10">
                    <div
                        className={`
                            mr-2 text-center rounded-full px-6 py-2 shadow-xl
                            ${room.verificationStatus === 'verified' ? 'bg-successGreen' : ''}
                            ${room.verificationStatus === 'pending' ? 'bg-yellow-500' : ''}
                            ${room.verificationStatus === 'reverify' ? 'bg-orange-500' : ''}
                            ${room.verificationStatus === 'rejected' ? 'bg-errorRed' : ''}
                            ${room.verificationStatus !== 'verified' && room.verificationStatus !== 'pending' && room.verificationStatus !== 'rejected' && room.verificationStatus !== 'reverify' ? 'bg-gray-400' : ''}
                        `}
                    >
                        <h1
                            title={room.verificationStatus.charAt(0).toUpperCase() + room.verificationStatus.slice(1)}
                            className="text-xl text-white italic">
                            {room.verificationStatus === 'verified' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" /></svg>
                            ) : room.verificationStatus === 'pending' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="m586-486 78-78-56-58-79 79 57 57Zm248 248-88-88-6-70 74-84-74-86 10-112-110-24-58-96-102 44-104-44-37 64-59-59 64-107 136 58 136-58 76 128 144 32-14 148 98 112-98 112 12 130Zm-456 76 102-44 104 44 38-64-148-148-36 36-142-142 56-56 86 84-21 21-203-203 6 68-74 86 74 84-10 114 110 24 58 96ZM344-60l-76-128-144-32 14-148-98-112 98-112-12-130-70-70 56-56 736 736-56 56-112-112-64 108-136-58-136 58Zm185-483Zm-145 79Z" /></svg>
                            ) : room.verificationStatus === 'rejected' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                            ) : room.verificationStatus === 'reverify' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="m482-200 114-113-114-113-42 42 43 43q-28 1-54.5-9T381-381q-20-20-30.5-46T340-479q0-17 4.5-34t12.5-33l-44-44q-17 25-25 53t-8 57q0 38 15 75t44 66q29 29 65 43.5t74 15.5l-38 38 42 42Zm165-170q17-25 25-53t8-57q0-38-14.5-75.5T622-622q-29-29-65.5-43T482-679l38-39-42-42-114 113 114 113 42-42-44-44q27 0 55 10.5t48 30.5q20 20 30.5 46t10.5 52q0 17-4.5 34T603-414l44 44ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" /></svg>
                            )}
                        </h1>
                    </div>
                </div>
            </div>

            {/* IMAGES */}
            <div className="flex flex-col mt-6 items-center">
                <RoomImagesCarousel images={room?.images} />
            </div>

            {/* TIMELINE */}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-3">Verification Timeline</h2>
                <ol className="relative border-l border-gray-500 ml-4">
                    <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
                        <p className="text-sm text-gray-400">Created At</p>
                        <p className="font-semibold">{formatDate(room.createdAt)}</p>
                    </li>

                    <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-yellow-400 rounded-full -left-1.5"></div>
                        <p className="text-sm text-gray-400">Verification Scheduled</p>
                        <p className="font-semibold">{formatDate(room.verificationSchedule)}</p>
                    </li>

                    <li className="ml-4">
                        <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-1.5"></div>
                        <p className="text-sm text-gray-400">Verified At</p>
                        <p className="font-semibold">{formatDate(room.dateVerified)}</p>
                    </li>
                </ol>
            </div>

            {/* ROOM DETAILS */}
            <div className="pl-4 mt-4">
                <label className="font-bold text-lg">Name</label>
                <div className="flex items-left">
                    <input
                        value={room.name ?? ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        style={{ width: 120 }}
                        className="px-2 py-2 bg-darkGray/30 rounded-2xl text-center text-lg mt-1 mb-3 border-0 text-white focus:outline-none focus:border-b-white"
                    />
                </div>

                <label className="font-bold text-lg">Monthly Rent</label>
                <p
                    className="mt-1 mb-3 text-lg bg-darkGray/30 rounded-2xl px-3 py-2"
                    style={{ width: 100 }}
                >
                    ₱{room.price ?? 0}.00
                </p>

                <label className="font-bold text-lg">Capacity</label>
                <div className="flex items-center">
                    <input
                        value={room.capacity ?? ""}
                        onChange={(e) => handleChange("capacity", e.target.value)}
                        style={{ width: 50 }}
                        className="px-2 py-2 bg-darkGray/30 rounded-2xl text-lg mt-1 mb-3 text-center border-0 text-white focus:outline-none focus:border-b-white"
                    />
                    <p className="ml-1">person(s)</p>
                </div>

                <AmenitiesSection
                    room={room}
                    propertyId={propertyId}
                    roomId={roomId}
                    setRoom={setRoom}
                />

                <label
                    className="text-errorRed hover:underline mt-6 text-sm inline-block cursor-pointer"
                    onClick={() => setShowConfirmDelete(true)}
                >
                    Delete Room
                </label>

                <ConfirmDialog
                    visible={showConfirmDelete}
                    title="Delete Room"
                    message="Are you sure you want to delete this room? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={async () => {
                        setShowConfirmDelete(false);
                        await handleDeleteRoom(roomId);
                    }}
                    onCancel={() => setShowConfirmDelete(false)}
                />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 fixed bottom-6 right-10">
                {room.verificationStatus === 'pending' || room.verificationStatus === 'reverify' ? (
                    <div className='flex flex-row gap-3'>
                        <button
                            onClick={() => handleVerify(roomId)}
                            className='font-semibold text-lg px-8 py-2 shadow-xl rounded-xl bg-successGreen text-white hover:cursor-pointer hover:bg-successGreen/70 transition duration-300'>
                            VERIFY
                        </button>

                    </div>
                ) : room.verificationStatus === 'verified' ? (
                    <button
                        onClick={() => handleUnverify(roomId)}
                        className='font-semibold text-lg px-6 py-2 shadow-xl rounded-xl bg-yellow-500 text-white hover:cursor-pointer hover:bg-yellow-700 transition duration-300'>
                        UNVERIFY
                    </button>
                ) : (
                    <div></div>
                )}

                <button
                    onClick={handleSave}
                    className="py-2 px-8 text-lg font-semibold bg-mainBlue rounded-xl hover:bg-hoverBlue transition duration-300"
                >
                    SAVE
                </button>
            </div>

            {/* DATE PICKER MODAL */}
            <AnimatePresence>
                {showDatePicker && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-bgBlue text-white w-70 px-5 py-6 rounded-2xl shadow-lg flex flex-col gap-4"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold">Schedule Verification</h2>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 rounded-lg text-white"
                            />
                            <div className="flex flex-row justify-end gap-3">
                                <button
                                    onClick={() => setShowDatePicker(false)}
                                    className="bg-errorRed px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleVerification}
                                    className="bg-mainBlue px-4 py-2 rounded-lg hover:bg-hoverBlue transition duration-200"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-successGreen text-white px-8 py-5 rounded-2xl shadow-lg"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                        >
                            <p className="text-lg font-semibold">
                                Room updated successfully!
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AlertContainer alerts={alerts} removeAlert={removeAlert} />
        </div>
    );
}
