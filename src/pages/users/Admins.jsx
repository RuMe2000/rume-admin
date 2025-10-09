import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAllAdmins, deleteUser } from "../../utils/firestoreUtils";

const Admins = () => {
    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        const fetchAdmins = async () => {
            const data = await getAllAdmins();
            setAdmins(data);
        };

        fetchAdmins();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteUser(id, "admins");
            setAdmins((prev) => prev.filter((admin) => admin.id !== id));
        } catch (error) {
            console.error("Error deleting admin:", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-row items-center text=white gap-3 mb-2">
                <button onClick={() => navigate('/users') } className="cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className="text-3xl font-bold">Admins</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="w-70 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Role</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            {/* <th className="w-15 px-4 py-2 border-b-3 border-darkGray text-center"></th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} className='text-center border-b border-darkGray'>
                                <td className='px-4 py-2 relative group cursor-pointer transition-all duration-200'>
                                    <span className='group-hover:hidden'>
                                        {admin.id.substring(0, 12)}...
                                    </span>
                                    <span className='hidden group-hover:inline-block transition-all duration-200'>
                                        {admin.id}
                                    </span>
                                </td>
                                <td className='px-4 py-2'>
                                    {admin?.firstName || admin?.lastName
                                            ? `${admin.firstName.charAt(0).toUpperCase() + admin.firstName.slice(1)} 
                                            ${admin.lastName.charAt(0).toUpperCase() + admin.lastName.slice(1)}`.trim()
                                            : 'Unknown'}
                                </td>
                                <td className='px-4 py-2'>{admin.email || 'Unknown'}</td>
                                <td className='px-4 py-2'>{admin.role.charAt(0).toUpperCase() + admin.role.slice(1) || 'Unknown'}</td>
                                <td className='px-4 py-2'>{admin.createdAt ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}</td>
                                {/* <td className='px-4 py-2'>
                                    <button
                                        // onClick={() => handleDelete(admin.id)}
                                        className='bg-errorRed px-3 py-1 rounded-2xl hover:bg-red-700 duration-300 transition'>
                                        Delete
                                    </button>
                                </td> */}

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Admins;