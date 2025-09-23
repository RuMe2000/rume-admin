import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { doc, getDoc, getDocs, updateDoc, collection, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import RoomImagesCarousel from "../../components/RoomImagesCarousel";
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="mt-4">
            <label className="font-bold text-lg">Amenities:</label>
            <div className="flex flex-wrap gap-2 mt-2">
                {room?.amenities && room.amenities.length > 0 ? (
                    room.amenities.map((amenity, idx) => (
                        <span
                            key={idx}
                            className="flex items-center gap-1 px-3 py-1 bg-mainBlue rounded-full text-white"
                        >
                            {amenity}
                            <button
                                onClick={() => handleDeleteAmenity(amenity)}
                                className="ml-1 text-white hover:scale-130 font-bold transition duration-200"
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
                    className="px-3 py-1 w-40 h-10 rounded-lg bg-darkGray/30 text-white focus:outline-none"
                />
                <button
                    onClick={handleAddAmenity}
                    title="Add"
                    className="px-2 py-2 bg-mainBlue text-white font-bold rounded-lg hover:bg-hoverBlue transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
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

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                //fetch room
                const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
                const roomSnap = await getDoc(roomRef);
                if (roomSnap.exists()) {
                    setRoom({ id: roomSnap.id, ...roomSnap.data() });
                }

                //fetch property name
                const propertyRef = doc(db, "properties", propertyId);
                const propertySnap = await getDoc(propertyRef);
                if (propertySnap.exists()) {
                    const propertyData = propertySnap.data();
                    setPropertyName(propertyData.name ?? "Unknown Property");
                }
            } catch (error) {
                console.error("Error fetching room or property:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [propertyId, roomId]);


    const handleChange = (field, value) => {
        setRoom(prev => ({ ...prev, [field]: value }));
    }

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        const roomRef = doc(db, 'properties', propertyId, 'rooms', roomId);

        await updateDoc(roomRef, {
            ...room,
            updatedAt: new Date(),
        });

        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            navigate(from || `/properties/view/${propertyId}`, { replace: true });
        }, 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-white italic">Loading room details...</p>
            </div>
        );
    };

    return (
        <div>
            <div className='flex flex-row items-center text-white justify-between'>
                <div className='flex flex-row gap-3'>
                    <button 
                    onClick={() => navigate(from || `/properties/view/${propertyId}`, { replace: true })}
                    className='cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                    </button>
                    <h1 className="text-3xl font-semibold">
                        {propertyName && room?.name ? `${propertyName} – ${room.name}` : "Loading…"}
                    </h1>
                </div>
                <div
                    className={`
                        mr-2 flex flex-row items-center rounded-full px-5 py-1
                        ${room.status === 'available' ? 'bg-successGreen' : ''}
                        ${room.status === 'occupied' ? 'bg-orange-400' : ''}
                        ${room.status !== 'available' && room.status !== 'occupied' ? 'bg-gray-400' : ''}
                    `}
                >
                    <h1 className="text-xl text-white italic">
                        {room.status
                            ? room.status.toUpperCase()
                            : 'Unknown'}
                    </h1>
                </div>
            </div>

            <div className='flex flex-col mt-6 ml-4 items-center justify-center'>
                <RoomImagesCarousel images={room?.images} />
            </div>

            <div className='flex flex-col mt-6 ml-4 items-start overflox-x-auto'>
                <label className='font-bold text-lg'>Monthly Rent:</label>
                <p className='mb-3'>₱{room.price ?? ''}.00</p>
                <label className='font-bold text-lg'>Capacity:</label>
                <div className="flex flex-row items-center">
                    <input
                        value={room.capacity ?? ''}
                        onChange={(e) => handleChange("capacity", e.target.value)}
                        style={{ width: 40 }}
                        className='px-2 py-2 bg-darkGray/30 rounded-lg text-center border-0 border-b-2 border-transparent text-white focus:outline-none focus:border-b-white'
                    />
                    <p className="ml-1">person(s)</p>
                </div>

                <AmenitiesSection
                    room={room}
                    propertyId={propertyId}
                    roomId={roomId}
                    setRoom={setRoom}
                />

            </div>

            <div className="flex flex-row gap-3 fixed bottom-6 right-7">
                {/* save button */}
                <button
                    onClick={handleSave}
                    className="py-2 px-8 text-lg font-semibold bg-successGreen rounded-lg hover:bg-successGreen/70 hover:cursor-pointer duration-300 transition">
                    SAVE
                </button>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-successGreen text-white px-8 py-5 rounded-lg shadow-lg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-lg font-semibold">Room updated successfully!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

