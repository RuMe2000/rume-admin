import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, getDocs, updateDoc, GeoPoint, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyProperty, unverifyProperty } from '../../utils/firestoreUtils';
import RoomCard from '../../components/RoomCard';

export default function ViewProperty() {
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    const GOOGLE_MAPS_API_KEY =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
        '';

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const fetchProperty = async () => {
        try {
            //get property doc
            const propertyRef = doc(db, "properties", propertyId);
            const snapshot = await getDoc(propertyRef);

            if (snapshot.exists()) {
                const propertyData = snapshot.data();

                //get owner name
                let ownerName = 'Unknown Owner';
                if (propertyData.ownerId) {
                    const ownerRef = doc(db, "users", propertyData.ownerId);
                    const ownerSnap = await getDoc(ownerRef);
                    if (ownerSnap.exists()) {
                        const { firstName = "", lastName = "" } = ownerSnap.data();
                        ownerName =
                            (firstName || lastName)
                                ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`.trim()
                                : "Unknown Owner";
                    }
                }

                //get rooms subcollection
                const roomsRef = collection(db, 'properties', propertyId, 'rooms');
                const roomsSnap = await getDocs(roomsRef);
                const roomsList = roomsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                //merge owner name into property
                setProperty({
                    ...propertyData,
                    ownerName,
                    rooms: roomsList,
                });
            }
        } catch (error) {
            console.error("Error fetching property:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperty();
    }, [propertyId]);

    const handleVerify = async (propertyId) => {
        try {
            await verifyProperty(propertyId); // update Firestore
            // update local state immediately
            setProperty(prev => ({
                ...prev,
                status: 'verified'
            }));
        } catch (error) {
            console.error('Error verifying property:', error);
            alert(error.message);
        }
    };

    const handleUnverify = async (propertyId) => {
        try {
            await unverifyProperty(propertyId); // update Firestore
            setProperty(prev => ({
                ...prev,
                status: 'pending'
            }));
        } catch (error) {
            console.error('Error unverifying property:', error);
            alert(error.message);
        }
    };


    const handleChange = (field, value) => {
        setProperty(prev => ({ ...prev, [field]: value }));
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        const propertyRef = doc(db, "properties", propertyId);

        //convert to geopoint
        const updatedLocation = new GeoPoint(
            Number(property.location.latitude.toFixed(7)),
            Number(property.location.longitude.toFixed(7))
        );

        await updateDoc(propertyRef, {
            ...property,
            location: updatedLocation,
            updatedAt: new Date(),
        });

        setShowSuccess(true); //show popup
        //hide popup after 2 seconds
        setTimeout(() => {
            setShowSuccess(false);
            navigate('/properties');
        }, 2000);
    };

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-white italic">Loading property details...</p>
            </div>
        );
    }

    const lat = property?.location?.latitude ?? 0;
    const lng = property?.location?.longitude ?? 0;
    const center = { lat, lng };

    return (
        <div className='p-6'>
            <div className='flex flex-row items-center text-white justify-between'>
                <div className='flex flex-row gap-3'>
                    <button onClick={() => navigate('/properties', { replace: true })}
                        className='cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                    </button>
                    <h1 className='text-3xl font-bold'>{property.name}</h1>
                </div>
                <div
                    className={`
                        mr-2 flex flex-row items-center rounded-full px-5 py-1
                        ${property.status === 'verified' ? 'bg-successGreen' : ''}
                        ${property.status === 'pending' ? 'bg-yellow-500' : ''}
                        ${property.status !== 'verified' && property.status !== 'pending' ? 'bg-gray-400' : ''}
                    `}
                >
                    <h1 className="text-xl text-white italic">
                        {property.status
                            ? property.status.toUpperCase()
                            : 'Unknown'}
                    </h1>
                </div>
            </div>

            <div className='flex flex-col mt-6 ml-4 items-center justify-center'>
                <div className='rounded-2xl overflow-hidden border border-gray-400' title='Property Image'
                    style={{ maxWidth: 800 }}
                >
                    {property.backgroundImageUrl ? (<img
                        src={property.backgroundImageUrl}
                    />
                    ) : (
                        <div className="w-300 h-800 rounded-2xl bg-gray-400 flex items-center justify-center">
                            <span className="text-2xl text-white">No photo</span>
                        </div>
                    )}
                </div>
            </div>

            <div className='pl-4 pb-4 mt-4 flex flex-col items-start overflox-x-auto rounded-2xl'>
                <div className="mt-4 w-full">
                    <label className="font-bold text-xl mt-3">Rooms</label>
                    <div className="grid grid-cols-5 gap-3 mt-1 mb-3">
                        {property?.rooms && property.rooms.length > 0 ? (
                            property.rooms.map((room) =>
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onManage={() =>
                                        navigate(`/properties/view/${propertyId}/room/${room.id}`, {
                                            state: { from: location.pathname },
                                        })}
                                />)
                        ) : (
                            <p className="text-gray-400 italic">No rooms listed.</p>
                        )}
                    </div>
                </div>

                {/* <label className='font-bold text-lg'>ID:</label>
                <p className='mb-3'>{propertyId ?? ''}</p> */}
                <label className='font-bold text-lg'>Owner</label>
                <p
                    className='px-2 py-2 mt-1 mb-3 text-lg bg-darkGray/30 rounded-2xl border-0 border-b-2 border-transparent text-white'
                    style={{ width: `${(property.ownerName ?? '').length + 1 || 1}ch` }}
                >
                    {property.ownerName ?? ''}
                </p>

                <label className='font-bold text-lg'>Property Name</label>
                <input
                    value={property.name ?? ''}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={{ width: `${(property.name ?? '').length || 1}ch` }}
                    className='px-2 py-2 mt-1 mb-3 text-lg bg-darkGray/30 rounded-2xl border-0 border-b-2 border-transparent text-white focus:outline-none focus:border-b-white'
                />

                <label className='font-bold text-xl'>Address</label>
                <input
                    value={property.address ?? ''}
                    onChange={(e) => handleChange("address", e.target.value)}
                    style={{ width: `${(property.address ?? '').length || 1}ch` }}
                    className='px-2 py-2 mt-1 text-lg bg-darkGray/30 rounded-2xl border-0 border-b-2 border-transparent text-white focus:outline-none focus:border-b-white'
                />

                {/* <label className='font-bold mt-4 text-lg'>Location:</label> */}
                <div className='flex flex-col mt-3'>
                    <div className='rounded-2xl overflow-hidden' style={{ height: 400, width: 700 }}>
                        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={15}>
                            <Marker
                                position={center}
                                draggable
                                onDragEnd={(e) => {
                                    const newLat = e.latLng.lat();
                                    const newLng = e.latLng.lng();
                                    setProperty(prev => ({
                                        ...prev,
                                        location: { latitude: newLat, longitude: newLng },
                                    }));
                                }}
                            />
                        </GoogleMap>
                    </div>
                    <p className="text-sm text-gray-400 italic">
                        Latitude: {Math.abs(property.location.latitude).toFixed(7)}° {property.location.latitude >= 0 ? 'N' : 'S'},
                        Longitude: {Math.abs(property.location.longitude).toFixed(7)}° {property.location.longitude >= 0 ? 'E' : 'W'}
                    </p>
                </div>

            </div>

            <div className="flex flex-row gap-3 fixed bottom-6 right-10">
                {property.status === 'pending' ? (
                    <button
                        onClick={() => handleVerify(propertyId)}
                        className="bg-successGreen font-semibold text-lg px-8 py-2 rounded-2xl hover:cursor-pointer hover:bg-successGreen/70 duration-300 transition"
                    >
                        VERIFY
                    </button>
                ) : (
                    <button
                        onClick={() => handleUnverify(propertyId)}
                        className="bg-yellow-500 font-semibold text-lg px-6 py-2 rounded-2xl hover:cursor-pointer hover:bg-yellow-700 duration-300 transition"
                    >
                        UNVERIFY
                    </button>
                )}

                {/* save button */}
                <button
                    onClick={handleSave}
                    className="py-2 px-8 text-lg font-semibold bg-successGreen rounded-2xl hover:bg-successGreen/70 hover:cursor-pointer duration-300 transition">
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
                            className="bg-successGreen text-white px-8 py-5 rounded-2xl shadow-lg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-lg font-semibold">Property updated successfully!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}