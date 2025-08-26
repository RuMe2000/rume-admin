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
        <div>
            <div className="flex flex-row items-center text=white gap-3 mb-6">
                <button onClick={() => navigate('/users')} className="cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className="text-3xl font-semibold">Admins</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Role</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} className='text-center border-b border-darkGray'>
                                <td className='w-50 px-4 py-2'>{admin.id}</td>
                                <td className='px-4 py-2'>{admin.name || 'N/A'}</td>
                                <td className='px-4 py-2'>{admin.email || 'N/A'}</td>
                                <td className='px-4 py-2'>{admin.role || 'N/A'}</td>
                                <td className='px-4 py-2'>{admin.createdAt ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
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

export default Admins;