import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import logo from '../assets/rume_logo.png';
import { motion, AnimatePresence } from 'framer-motion';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            //get user data from firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                throw new Error("No user data found.");
            }

            const userData = userDocSnap.data();

            //check if user role is admin
            if (userData.role !== 'admin') {
                throw new Error("Access denied!");
            }

            setShowSuccess(true); //show popup
            //hide popup after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            console.log(error.message);
            toast.error(error.message, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                progress: undefined,
            });
        }
    }

    return (
        <div className='flex min-h-screen min-w-screen bg-bgBlue overflow-hidden fixed top-0 left-0'>
            {/* Oversized Logo */}
            <img
                src={logo}
                alt="Logo"
                className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 scale-[1.4] z-0 opacity-60 pointer-events-none"
            />
            {/* left side for logo */}
            <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
                {/* Foreground Text */}
                <h1 className="text-[13rem] pt-15 font-bold text-mainBlue z-10">RuMe.</h1>
            </div>

            {/* right side for form */}
            <div className='w-1/2 bg-transparent flex items-center justify-center z-10 pr-10'>
                <form onSubmit={handleSubmit} className='w-full max-w-md px-8 py-10 bg-blue-500/10 border border-white/20 rounded-2xl shadow-lg'>
                    <h1 className='text-4xl font-bold text-center mb-8 text-white'>Login</h1>

                    <div className='mb-4'>
                        <label htmlFor='email' className='block text-white text-lg font-medium mb-3'>Email</label>
                        <input
                            id='email'
                            name='email'
                            type='email'
                            className="w-full p-3 px-4 mb-2 text-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mainBlue transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor='password' className='block text-white text-lg font-medium mb-3'>Password</label>
                        <input
                            id='password'
                            name='password'
                            type='password'
                            className='w-full p-3 px-4 text-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mainBlue transition'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type='submit' className='w-full p-3 mt-5 bg-mainBlue text-xl text-white font-bold rounded-2xl hover:bg-hoverBlue cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300'>
                        Login
                    </button>
                </form>
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
                            className="bg-mainBlue text-white px-13 py-5 rounded-2xl shadow-lg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-lg font-semibold">Welcome, Admin!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Login;

