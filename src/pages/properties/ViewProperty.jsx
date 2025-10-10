import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, replace } from 'react-router-dom';
import { doc, getDoc, getDocs, updateDoc, GeoPoint, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyProperty, unverifyProperty, rejectProperty, deleteProperty } from '../../utils/firestoreUtils';
import RoomCard from '../../components/RoomCard';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const libraries = ['marker'];

export default function ViewProperty() {
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [marker, setMarker] = useState(null);
    const [showRoomDatePicker, setShowRoomDatePicker] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;
    const auth = getAuth();

    const handleEditClick = () => {
        setShowPasswordPrompt(true);
    };

    const handleConfirmPassword = async () => {
        setError("");
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                setError("Admin not signed in.");
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            setIsEditing(true);
            setShowPasswordPrompt(false);
            setPassword("");
        } catch (error) {
            console.error("Reauth failed:", error);
            setError("Invalid password.");
        }
    };

    const handleScheduleRoomsVerification = async () => {
        if (!selectedDate) {
            alert("Please select a date first.");
            return;
        }

        try {
            const roomsRef = collection(db, "properties", propertyId, "rooms");
            const roomsSnap = await getDocs(roomsRef);

            const batchUpdates = [];

            roomsSnap.forEach((roomDoc) => {
                const roomData = roomDoc.data();
                if (roomData.verificationStatus === "pending" || roomData.verificationStatus === "reverify") {
                    const roomRef = doc(db, "properties", propertyId, "rooms", roomDoc.id);
                    batchUpdates.push(updateDoc(roomRef, {
                        verificationSchedule: Timestamp.fromDate(new Date(selectedDate)),
                        updatedAt: new Date(),
                    }));
                }
            });

            await Promise.all(batchUpdates);

            // Update UI (optional)
            setProperty((prev) => ({
                ...prev,
                rooms: prev.rooms.map((room) =>
                    room.verificationStatus === "pending" || room.verificationStatus === "reverify"
                        ? { ...room, verificationSchedule: new Date(selectedDate) }
                        : room
                ),
            }));

            setShowRoomDatePicker(false);
            setSelectedDate("");
            alert("Verification schedule updated for pending and reverify rooms!");
        } catch (error) {
            console.error("Error scheduling room verification:", error);
            alert("Failed to schedule verification for rooms.");
        }
    };

    const handleScheduleVerification = async () => {
        if (!selectedDate) {
            alert("Please select a date first.");
            return;
        }
        try {
            const propertyRef = doc(db, "properties", propertyId);
            await updateDoc(propertyRef, {
                verificationSchedule: Timestamp.fromDate(new Date(selectedDate)),
                updatedAt: new Date(),
            });

            setProperty(prev => ({
                ...prev,
                verificationSchedule: new Date(selectedDate),
            }));

            setShowDatePicker(false);
            setSelectedDate("");
            // alert("Verification schedule saved!");
        } catch (error) {
            console.error("Error scheduling verification:", error);
            alert("Failed to schedule verification.");
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    const GOOGLE_MAPS_API_KEY =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
        '';

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
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

    // Update marker draggable state when isEditing changes
    useEffect(() => {
        if (marker) {
            marker.gmpDraggable = isEditing;

            if (isEditing) {
                // Enable drag listener
                const handleDragEnd = (event) => {
                    const newLat = event.latLng.lat();
                    const newLng = event.latLng.lng();
                    setProperty((prev) => ({
                        ...prev,
                        location: { latitude: newLat, longitude: newLng },
                    }));
                };
                marker.addListener("dragend", handleDragEnd);

                return () => google.maps.event.clearListeners(marker, "dragend");
            } else {
                google.maps.event.clearListeners(marker, "dragend");
            }
        }
    }, [isEditing, marker]);

    const handleVerify = async (propertyId) => {
        try {
            await verifyProperty(propertyId); // update Firestore
            // update local state immediately
            setProperty(prev => ({
                ...prev,
                status: 'verified',
                dateVerified: new Date()
            }));
        } catch (error) {
            console.error('Error verifying property:', error);
            alert(error.message);
        }
    };

    const handleReject = async (propertyId) => {
        try {
            await rejectProperty(propertyId); // update Firestore
            setProperty(prev => ({
                ...prev,
                status: 'rejected'
            }));
        } catch (error) {
            console.error('Error rejecting property:', error);
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
            navigate('/properties', { replace: true });
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
            <div className="flex flex-col gap-3 items-center fixed top-8 right-10">
                <div
                    className={`
                            mr-2 text-center rounded-full px-6 py-2 shadow-xl
                            ${property.status === 'verified' ? 'bg-successGreen' : ''}
                            ${property.status === 'pending' ? 'bg-yellow-500' : ''}
                            ${property.status === 'rejected' ? 'bg-errorRed' : ''}
                            ${property.status !== 'verified' && property.status !== 'pending' && property.status !== 'rejected' ? 'bg-gray-400' : ''}
                        `}
                >
                    <h1
                        title={property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        className="text-xl text-white italic">
                        {property.status === 'verified' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" /></svg>
                        ) : property.status === 'pending' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="m586-486 78-78-56-58-79 79 57 57Zm248 248-88-88-6-70 74-84-74-86 10-112-110-24-58-96-102 44-104-44-37 64-59-59 64-107 136 58 136-58 76 128 144 32-14 148 98 112-98 112 12 130Zm-456 76 102-44 104 44 38-64-148-148-36 36-142-142 56-56 86 84-21 21-203-203 6 68-74 86 74 84-10 114 110 24 58 96ZM344-60l-76-128-144-32 14-148-98-112 98-112-12-130-70-70 56-56 736 736-56 56-112-112-64 108-136-58-136 58Zm185-483Zm-145 79Z" /></svg>
                        ) : property.status === 'rejected' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#FFFFFF"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" /></svg>
                        )}
                    </h1>
                </div>
            </div>

            <div className='flex flex-row gap-3'>
                <button onClick={() => navigate('/properties', replace(true))}
                    className='cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className='text-3xl font-bold'>{property.name}</h1>
            </div>

            <div className='flex flex-col mt-6 ml-4 items-center justify-center'>
                <div className='rounded-2xl overflow-hidden border border-gray-400' title='Property Image'
                    style={{ maxWidth: 800 }}
                >
                    {property.verificationData.propertyFrontUrl ? (<img
                        src={property.verificationData.propertyFrontUrl}
                    />
                    ) : (
                        <div className="w-300 h-800 rounded-2xl bg-gray-400 flex items-center justify-center">
                            <span className="text-2xl text-white">No photo</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Section */}
            <div className="mt-4 rounded-2xl w-80 text-white">
                <h2 className="text-xl font-bold mb-2">Verification Timeline</h2>
                <ol className="relative border-l border-gray-500 ml-4">
                    {/* Created At */}
                    <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 border border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-400">
                            Created At
                        </time>
                        <p className="text-base font-semibold">
                            {formatDate(property.createdAt)}
                        </p>
                    </li>

                    {/* Verification Schedule */}
                    <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-yellow-400 rounded-full -left-1.5 border border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-400">
                            Verification Scheduled
                        </time>
                        <p className="text-base font-semibold">
                            {formatDate(property.verificationSchedule)}
                        </p>
                    </li>

                    {/* Date Verified */}
                    <li className="ml-4">
                        <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-1.5 border border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-400">
                            Verified At
                        </time>
                        <p className="text-base font-semibold">
                            {formatDate(property.dateVerified)}
                        </p>

                        {/* Conditional for verification sheet */}
                        {property.verificationSheetUrl ? (
                            <a
                                href={property.verificationSheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-mainBlue hover:underline mt-2 inline-block"
                            >
                                View Verification Sheet
                            </a>
                        ) : (
                            <label className="text-mainBlue hover:underline mt-2 inline-block cursor-pointer">
                                Upload Verification Sheet
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        try {
                                            // Upload to Firebase Storage
                                            const storage = getStorage();
                                            const fileRef = ref(
                                                storage,
                                                `verification_sheets/${propertyId}/verification_sheet.pdf`
                                            );
                                            await uploadBytes(fileRef, file);
                                            const downloadUrl = await getDownloadURL(fileRef);

                                            // Update property doc with the file URL (fixed: use propertyId instead of property.id)
                                            const propertyRef = doc(db, "properties", propertyId);
                                            await updateDoc(propertyRef, {
                                                verificationSheetUrl: downloadUrl,
                                            });

                                            // Update local state
                                            setProperty(prev => ({
                                                ...prev,
                                                verificationSheetUrl: downloadUrl
                                            }));

                                            alert("Verification sheet uploaded!");
                                        } catch (error) {
                                            console.error("Error uploading verification sheet:", error);
                                            alert("Failed to upload verification sheet: " + error.message);
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </li>
                </ol>
            </div>

            <div className='pb-4 flex flex-col items-start overflox-x-auto rounded-2xl'>
                <div className="mt-4 w-full">
                    <div className="flex items-center justify-between w-full mt-3">
                        <label className="font-bold text-xl">Rooms</label>
                        <button
                            onClick={() => setShowRoomDatePicker(true)}
                            className="flex items-center gap-2 bg-mainBlue text-white px-4 py-2 rounded-xl shadow hover:bg-hoverBlue transition duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#FFFFFF">
                                <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
                            </svg>
                            Schedule Rooms Verification
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-2 mb-3">
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
                    className='w-70 px-3 py-2 mt-1 mb-3 text-lg bg-darkGray/30 rounded-2xl border-0 border-b-2 border-transparent text-white'
                >
                    {property.ownerName ?? ''}
                </p>

                <div className='w-full flex flex-row items-start justify-between'>
                    <div className='flex flex-col'>
                        <label className='font-bold text-lg'>Property Name</label>
                        <input
                            value={property.name ?? ''}
                            onChange={(e) => handleChange("name", e.target.value)}
                            disabled={!isEditing}
                            className={`w-70 px-3 py-2 mt-1 mb-3 text-lg rounded-2xl border-0 ${isEditing
                                ? "bg-darkGray/30 text-white focus:outline-none focus:border-b-white"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                }`}
                        />
                    </div>

                    <button
                        onClick={handleEditClick}
                        className="bg-orange text-white px-5 py-2 mb-2 mt-2 rounded-lg shadow hover:bg-orange/70 transition duration-200"
                    >
                        {isEditing ? "EDITING ENABLED" : "EDIT"}
                    </button>

                </div>

                <label className='font-bold text-xl'>Address</label>
                <input
                    value={property.address ?? ''}
                    onChange={(e) => handleChange("address", e.target.value)}
                    disabled={!isEditing}
                    style={{ width: 700 }}
                    className={`px-3 py-2 mt-1 mb-3 text-lg rounded-2xl border-0 ${isEditing
                        ? "bg-darkGray/30 text-white focus:outline-none focus:border-b-white"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                />

                {/* <label className='font-bold mt-4 text-lg'>Location:</label> */}
                <div className='flex flex-col mt-3'>
                    <div className='rounded-2xl overflow-hidden' style={{ height: 400, width: 700 }}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={center}
                            zoom={15}
                            options={{
                                mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
                                disableDefaultUI: true,
                            }}
                            onLoad={(mapInstance) => {
                                const { AdvancedMarkerElement } = google.maps.marker;

                                // Create marker and store in state
                                const newMarker = new AdvancedMarkerElement({
                                    map: mapInstance,
                                    position: center,
                                    title: property.name || "Property Location",
                                    gmpDraggable: isEditing,
                                });

                                setMarker(newMarker); // ✅ link marker to state

                                // Allow map panning and marker dragging
                                mapInstance.setOptions({ gestureHandling: "greedy" });
                            }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 italic">
                        Latitude: {Math.abs(property.location.latitude).toFixed(7)}° {property.location.latitude >= 0 ? 'N' : 'S'},
                        Longitude: {Math.abs(property.location.longitude).toFixed(7)}° {property.location.longitude >= 0 ? 'E' : 'W'}
                    </p>
                </div>

                {/* valid documents */}
                <div className="mt-3">
                    <label className="font-bold text-lg block mb-1">Verification Documents</label>
                    {property.verificationData ? (
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={property.verificationData.businessPermitUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Business Permit"
                                className="px-4 py-2 bg-yellow text-white rounded-xl shadow hover:bg-yellow/70 hover:scale-105 transition duration-200"
                            >
                                Business Permit
                            </a>

                            <a
                                href={property.verificationData.validIdFrontUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Valid ID (Front)"
                                className="px-4 py-2 bg-yellow text-white rounded-xl shadow hover:bg-yellow/70 hover:scale-105 transition duration-200"
                            >
                                Valid ID (Front)
                            </a>

                            <a
                                href={property.verificationData.validIdBackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Valid ID (Back)"
                                className="px-4 py-2 bg-yellow text-white rounded-xl shadow hover:bg-yellow/70 hover:scale-105 transition duration-200"
                            >
                                Valid ID (Back)
                            </a>
                        </div>
                    ) : (
                        <p className="text-gray-400 mt-2">No verification documents available.</p>
                    )}
                </div>

                <label
                    className="text-errorRed hover:underline mt-6 text-sm inline-block cursor-pointer"
                    onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
                            try {
                                await deleteProperty(propertyId);
                                alert("Property deleted successfully!");
                                navigate("/properties", { replace: true });
                            } catch (error) {
                                alert("Failed to delete property: " + error.message);
                            }
                        }
                    }}
                >
                    Delete Property
                </label>
            </div>

            <div className="flex flex-row gap-3 fixed bottom-6 left-77">
                {property.status === 'pending' ? (
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className="bg-blue-500 font-semibold text-lg px-5 py-3 shadow-xl rounded-xl hover:cursor-pointer hover:bg-blue-700 duration-300 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" /></svg>
                    </button>
                ) : (
                    <div>
                    </div>
                )}
            </div>

            <div className="flex flex-row gap-3 fixed bottom-6 right-10">
                {property.status === 'pending' ? (
                    <div className='flex flex-row gap-3'>
                        <button
                            onClick={() => handleVerify(propertyId)}
                            className='font-semibold text-lg px-8 py-2 shadow-xl rounded-xl bg-successGreen text-white hover:cursor-pointer hover:bg-successGreen/70 transition duration-300'>
                            VERIFY
                        </button>
                        <button
                            onClick={() => handleReject(propertyId)}
                            className='font-semibold text-lg px-8 py-2 shadow-xl rounded-xl bg-errorRed text-white hover:cursor-pointer hover:bg-red-700 transition duration-300'>
                            REJECT
                        </button>
                    </div>
                ) : (
                    <button
                        disabled={!isEditing}
                        onClick={() => handleReject(propertyId)}
                        className={`font-semibold text-lg px-8 py-2 shadow-xl rounded-xl ${isEditing
                            ? "bg-errorRed text-white hover:cursor-pointer hover:bg-red-700 transition duration-300"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}>
                        REJECT
                    </button>
                )}

                {/* save button */}
                <button
                    onClick={handleSave}
                    disabled={!isEditing}
                    className={`font-semibold text-lg px-8 py-2 shadow-xl rounded-xl ${isEditing
                        ? "bg-successGreen text-white hover:cursor-pointer hover:bg-successGreen/70 transition duration-300"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}>
                    SAVE
                </button>
            </div>

            {showPasswordPrompt && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-bgBlue text-white p-6 rounded-xl w-80 border border-darkGray">
                        <h2 className="text-lg font-bold mb-3">Confirm Password</h2>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-3 py-2 mb-3 border rounded-lg"
                        />
                        {error && <p className="text-errorRed text-sm mb-2">{error}</p>}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPasswordPrompt(false)}
                                className="bg-errorRed px-3 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPassword}
                                className="bg-mainBlue text-white px-3 py-2 rounded-lg hover:bg-hoverBlue transition duration-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showDatePicker && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
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

            <AnimatePresence>
                {showRoomDatePicker && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-bgBlue text-white w-90 px-5 py-6 rounded-2xl shadow-lg flex flex-col gap-4"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold">Schedule Verification for Rooms</h2>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 rounded-lg text-white"
                            />
                            <div className="flex flex-row justify-end gap-3">
                                <button
                                    onClick={() => setShowRoomDatePicker(false)}
                                    className="bg-errorRed px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleRoomsVerification}
                                    className="bg-mainBlue px-4 py-2 rounded-lg hover:bg-hoverBlue transition duration-200"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
};