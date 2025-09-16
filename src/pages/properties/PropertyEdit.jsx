import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function PropertyEdit() {
    const { propertyId } = useParams();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from;

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                //get property doc
                const propertyRef = doc(db, "properties", propertyId);
                const snapshot = await getDoc(propertyRef);

                if (snapshot.exists()) {
                    const propertyData = snapshot.data();

                    //get owner name
                    let ownerName = 'yuyuyuy';
                    if (propertyData.ownerId) {
                        const ownerRef = doc(db, "users", propertyData.ownerId);
                        const ownerSnap = await getDoc(ownerRef);
                        if (ownerSnap.exists()) {
                            const { firstName = "", lastName = "" } = ownerSnap.data();
                            ownerName =
                                (firstName || lastName)
                                    ? `${firstName} ${lastName}`.trim()
                                    : "kakaka";
                        }
                    }

                    //merge owner name into property
                    setProperty({ ...propertyData, ownerName });
                }
            } catch (error) {
                console.error("Error fetching property:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const handleChange = (field, value) => {
        setProperty(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const propertyRef = doc(db, "properties", propertyId);
        await updateDoc(propertyRef, {
            ...property,
            updatedAt: new Date(),
        });
        navigate('/properties');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-white italic">Loading property details...</p>
            </div>
        );
    }

    return (
        <div>
            <div className='flex flex-row items-center text-white justify-between'>
                <div className='flex flex-row gap-3'>
                    <button onClick={() => navigate(from)} className='cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                    </button>
                    <h1 className='text-3xl font-semibold'>{property.name}</h1>
                </div>
                <div className={`
                    mr-2 flex flex-row items-center rounded-md px-5 py-1
                    ${property.status === 'verified' ? 'bg-successGreen' : ''}
                    ${property.status === 'pending' ? 'bg-orange-400' : ''} `}>
                    <h1 className='text-xl font-semibold mr-2'>STATUS:</h1>
                    <h1 className='text-xl color-white italic '>{property.status}</h1>
                </div>
            </div>

            <div className='flex flex-col mt-6 ml-4 items-start overflox-x-auto'>
                <p className=''>ID: {propertyId ?? ''}</p>
                <p className='mb-3'>Owner: {property.ownerName ?? ''}</p>
                <label className='font-bold mb-1 text-lg'>Property Name:</label>
                <input
                    value={property.name ?? ''}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={{ width: `${(property.address ?? '').length || 1}ch` }}
                    className='px-2 py-2 bg-darkGray/30 rounded-md border-0 border-b-2 border-transparent text-white focus:outline-none focus:border-b-white'
                />

                <label className='font-bold mt-4 text-lg'>Address:</label>
                <input
                    value={property.address ?? ''}
                    onChange={(e) => handleChange("address", e.target.value)}
                    style={{ width: `${(property.address ?? '').length || 1}ch` }}
                    className='px-2 py-2 bg-darkGray/30 rounded-md border-0 border-b-2 border-transparent text-white focus:outline-none focus:border-b-white'
                />

                {/* replace with actual map later */}
                <label className='font-bold mt-4 text-lg'>Geolocation:</label>
                <input
                    value={`${Math.abs(property.location.latitude)}°${property.location.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(property.location.longitude)}°${property.location.longitude >= 0 ? 'E' : 'W'}` ?? ''}
                    onChange={(e) => handleChange("location", e.target.value)}
                    style={{ width: `${(property.address ?? '').length || 1}ch` }}
                    className='px-2 py-2 bg-darkGray/30 rounded-md border-0 border-b-2 border-transparent text-white focus:outline-none focus:border-b-white'
                />
            </div>

            <div className="fixed bottom-6 right-7 hover:scale-105 duration-200 transition">
                <button
                    onClick={handleSave}
                    className="py-2 px-10 text-xl font-bold bg-mainBlue rounded-md hover:cursor-pointer">
                    Save
                </button>
            </div>
        </div>
    );
}