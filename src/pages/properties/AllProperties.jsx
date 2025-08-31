import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllProperties } from '../../utils/firestoreUtils';

const AllProperties = () => {
    const navigate = useNavigate();

    const [allProperties, setAllProperties] = useState([]);

    const [hoveredId, setHoveredId] = useState(null);
    const [hoveredOwnerId, setHoveredOwnerId] = useState(null);

    useEffect(() => {
        const fetchAllProperties = async () => {
            const data = await getAllProperties();
            setAllProperties(data);
        };

        fetchAllProperties();
    }, []);

    return (
        <div>
            <div className='flex flex-row items-center text=white gap-3 mb-6'>
                <button onClick={() => navigate('/properties')} className='cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className='text-3xl font-semibold'>All Properties</h1>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full text-white rounded-md'>
                    <thead>
                        <tr>
                            <th className='w-35 px-4 py-2 border-b-3 border-darkGray text-center'>Property ID</th>
                            <th className="w-35 px-4 py-2 border-b-3 border-darkGray text-center">Owner ID</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Address</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Location</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date Uploaded</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allProperties.map((property) => (
                            <tr key={property.id} className='text-center border-b border-darkGray'>
                                <td className='px-4 py-2 relative'
                                    onMouseEnter={() => setHoveredId(property.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    {`${property.id.substring(0, 7)}...`}
                                    {hoveredId === property.id && (
                                        <div className='absolute bg-gray-700 text-white text-xs font-bold p-2 rounded-md whitespace-nowrap z-50'>
                                            {property.id}
                                        </div>
                                    )}
                                </td>
                                <td className='px-4 py-2 relative'
                                    onMouseEnter={() => setHoveredOwnerId(property.ownerId)}
                                    onMouseLeave={() => setHoveredOwnerId(null)}
                                >
                                    {`${property.ownerId.substring(0, 7)}...`}
                                    {hoveredOwnerId === property.ownerId && (
                                        <div className='absolute bg-gray-700 text-white text-xs font-bold p-2 rounded-md whitespace-nowrap z-50'>
                                            {property.ownerId}
                                        </div>
                                    )}
                                </td>
                                <td className='px-4 py-2'>{property.name || 'N/A'}</td>
                                <td className='px-4 py-2'>{property.address || 'N/A'}</td>
                                <td className='px-4 py-2'>{property.location ? `${property.location._lat}, ${property.location._long}` : 'N/A'}</td>
                                <td className='px-4 py-2'>{property.timestamp ? new Date(property.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className='px-4 py-2'>
                                    <button
                                        // onClick={() => handleDelete(admin.id)}
                                        className='bg-errorRed px-3 py-1 rounded-lg hover:bg-red-700 duration-300 transition'>
                                        Delete
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AllProperties;