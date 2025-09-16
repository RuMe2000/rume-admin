import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getVerifiedProperties } from '../../utils/firestoreUtils';

const VerifiedProperties = () => {
    const navigate = useNavigate();

    const [verifiedProperties, setVerifiedProperties] = useState([]);

    useEffect(() => {
        const fetchVerifiedProperties = async () => {
            const data = await getVerifiedProperties();
            setVerifiedProperties(data);
        };

        fetchVerifiedProperties();
    }, []);

    return (
        <div>
            <div className='flex flex-row items-center text=white gap-3 mb-6'>
                <button onClick={() => navigate('/properties')} className='cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className='text-3xl font-semibold'>Verified Properties</h1>
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
                        {verifiedProperties.map((property) => (
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
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M710-150q-63 0-106.5-43.5T560-300q0-63 43.5-106.5T710-450q63 0 106.5 43.5T860-300q0 63-43.5 106.5T710-150Zm0-80q29 0 49.5-20.5T780-300q0-29-20.5-49.5T710-370q-29 0-49.5 20.5T640-300q0 29 20.5 49.5T710-230Zm-550-30v-80h320v80H160Zm90-250q-63 0-106.5-43.5T100-660q0-63 43.5-106.5T250-810q63 0 106.5 43.5T400-660q0 63-43.5 106.5T250-510Zm0-80q29 0 49.5-20.5T320-660q0-29-20.5-49.5T250-730q-29 0-49.5 20.5T180-660q0 29 20.5 49.5T250-590Zm230-30v-80h320v80H480Zm230 320ZM250-660Z" /></svg>
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

export default VerifiedProperties;