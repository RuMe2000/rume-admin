import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { doc, getDoc, getDocs, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import RoomImagesCarousel from "../../components/RoomImagesCarousel";

export default function ViewRoom() {
    const { propertyId, roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [propertyName, setPropertyName] = useState(""); // 👈 store property name here
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 🔹 1. fetch room
                const roomRef = doc(db, "properties", propertyId, "rooms", roomId);
                const roomSnap = await getDoc(roomRef);
                if (roomSnap.exists()) {
                    setRoom({ id: roomSnap.id, ...roomSnap.data() });
                }

                // 🔹 2. fetch property name
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

        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            navigate(from);
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
                    <button onClick={() => navigate(from)} className='cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition'>
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
                <label className='font-bold text-lg'>Amenities:</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {room?.amenities && room.amenities.length > 0 ? (
                        room.amenities.map((amenity, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-darkGray/30 rounded-full text-sm text-white"
                            >
                                {amenity}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-400 italic">No amenities listed.</p>
                    )}
                </div>
            </div>
        </div>
    )
}