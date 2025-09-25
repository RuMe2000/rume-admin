import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { serverTimestamp } from 'firebase/firestore';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
            if (user) {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    firstName: fname,
                    lastName: lname,
                    role: "admin",
                    createdAt: serverTimestamp(),
                });
            }
            console.log("Admin registered successfully!");
            toast.success("Admin registered successfully!", { position: "top-center" });
        } catch (error) {
            console.log(error.message);
            toast.error(error.message, { position: "bottom-center" });
        }

    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-white'>
            <form onSubmit={handleRegister} className='w-full max-w-md p-8 bg-white rounded-2xl shadow-lg'>
                <h1 className='text-3xl font-bold text-center mb-6'>Sign Up</h1>

                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>First Name</label>
                    <input
                        type='text'
                        onChange={(e) => setFname(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required></input>
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Last Name</label>
                    <input
                        type='text'
                        onChange={(e) => setLname(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required>
                    </input>
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input
                        type='email'
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required>
                    </input>
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Password</label>
                    <input
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required>
                    </input>
                </div>

                <button
                    type='submit'
                    className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default Register;