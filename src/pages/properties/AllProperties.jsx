import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllProperties } from '../../utils/firestoreUtils';

const AllProperties = () => {
    const navigate = useNavigate();

    const [allProperties, setAllProperties] = useState([]);

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
                            <th className='px-4 py-2 border-b-3 border-darkGray text-center'>ID</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Owner</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Address</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {allProperties.map((property) => (
                            <tr key={property.id} className='text-center border-b border-darkGray'>
                                <td className='px-4 py-2 relative group cursor-pointer'>
                                    <span className='group-hover:hidden'>
                                        {property.id.substring(0, 12)}...
                                    </span>
                                    <span className='hidden group-hover:inline-block transition-normal duration-200'>
                                        {property.id}
                                    </span>
                                </td>
                                <td className='px-2 py-2 relative'>{property.ownerName}</td>
                                <td className='px-2 py-2'>{property.name || 'N/A'}</td>
                                <td className='px-2 py-2'>{property.address || 'N/A'}</td>
                                <td className='px-2 py-2'>{property.timestamp ? new Date(property.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className={`
                                    px-2 py-2 rounded-md italic font-semibold
                                    ${property.status === 'verified' ? 'text-successGreen' : ''}
                                    ${property.status === 'pending' ? 'text-orange-400' : ''}
                                    `}>
                                    {property.status || 'N/A'}
                                </td>
                                <td className='px-4 py-2'>
                                    <button
                                        onClick={() =>
                                            navigate(`/properties/edit/${property.id}`, {
                                                state: { from: location.pathname },
                                            })}
                                        className='bg-mainBlue px-3 py-1 rounded-lg hover:bg-hoverBlue hover:cursor-pointer duration-300 transition'>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg>                                    </button>
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