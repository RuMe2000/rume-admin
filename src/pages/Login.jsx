import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import logo from "../assets/rume_logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const navigate = useNavigate();
    const { setLoginInProgress } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setIsAuthenticating(true);
        setLoginInProgress(true);

        try {
            await setPersistence(auth, browserSessionPersistence);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await auth.signOut();
                throw new Error("No user data found.");
            }

            const userData = userDocSnap.data();

            if (userData.role !== "admin") {
                await auth.signOut();
                throw new Error("Access denied!");
            }

            // ✅ Show success popup
            setShowSuccess(true);

            // ⏱️ Navigate after 2 seconds
            setTimeout(() => {
                setLoginInProgress(false); // ✅ Allow navigation now
                navigate("/dashboard");
            }, 2000);

        } catch (error) {
            console.error(error);
            setIsAuthenticating(false);
            setLoginInProgress(false); // ✅ Reset on error

            let message = "An error occurred. Please try again.";
            if (error.code === "auth/invalid-credential") message = "Invalid admin credential.";
            else if (error.code === "auth/user-not-found") message = "No account found with this email.";
            else if (error.code === "auth/too-many-requests") message = "Too many failed attempts. Try again later.";
            else if (error.message === "Access denied!") message = "Access denied! Admins only.";
            else if (error.message === "No user data found.") message = "User record not found.";

            setErrorMessage(message);
        }
    };

    // ✅ Show popup
    if (showSuccess) {
        return (
            <div className='flex min-h-screen min-w-screen bg-bgBlue overflow-hidden fixed top-0 left-0'>
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 scale-[1.4] z-0 opacity-60 pointer-events-none"
                />

                <div className="relative w-full h-screen overflow-hidden flex justify-center items-center">
                    <h1 className="text-[13rem] pt-15 font-bold text-mainBlue z-10">RuMe.</h1>
                </div>

                <div className='w-1/2 bg-transparent flex items-center justify-center z-10 pr-10'>
                    <div className='w-full max-w-md px-8 py-10 bg-blue-500/10 border border-white/20 rounded-2xl shadow-lg'>
                        <h1 className='text-4xl font-bold text-center mb-8 text-white'>Login</h1>
                        <div className="text-center text-white text-lg">Logging you in...</div>
                    </div>
                </div>

                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-mainBlue text-white px-8 py-5 rounded-2xl shadow-lg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-lg font-semibold">Welcome, Admin!</p>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    // Normal login form
    return (
        <div className='flex min-h-screen min-w-screen bg-bgBlue overflow-hidden fixed top-0 left-0'>
            <img
                src={logo}
                alt="Logo"
                className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 scale-[1.4] z-0 opacity-60 pointer-events-none"
            />

            <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
                <h1 className="text-[13rem] pt-15 font-bold text-mainBlue z-10">RuMe.</h1>
            </div>

            <div className='w-1/2 bg-transparent flex items-center justify-center z-10 pr-10'>
                <form
                    onSubmit={handleSubmit}
                    className='w-full max-w-md px-8 py-10 bg-blue-500/10 border border-white/20 rounded-2xl shadow-lg'
                >
                    <h1 className='text-4xl font-bold text-center mb-8 text-white'>Login</h1>

                    <div className='mb-4'>
                        <label htmlFor='email' className='block text-white text-lg font-medium mb-3'>
                            Email
                        </label>
                        <input
                            id='email'
                            name='email'
                            type='email'
                            className="w-full p-3 px-4 mb-2 text-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mainBlue transition bg-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isAuthenticating}
                            required
                        />
                    </div>

                    <div className='mb-2'>
                        <label htmlFor='password' className='block text-white text-lg font-medium mb-3'>
                            Password
                        </label>
                        <input
                            id='password'
                            name='password'
                            type='password'
                            className='w-full p-3 px-4 text-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mainBlue transition bg-transparent'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isAuthenticating}
                            required
                        />
                    </div>

                    {errorMessage && (
                        <p className="text-errorRed text-sm mt-2 mb-2">{errorMessage}</p>
                    )}

                    <button
                        type='submit'
                        className='w-full p-3 mt-4 bg-mainBlue text-xl text-white font-bold rounded-2xl hover:bg-hoverBlue cursor-pointer focus:outline-none transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isAuthenticating}
                    >
                        {isAuthenticating ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;