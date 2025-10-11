import { AnimatePresence, motion } from "framer-motion";

export default function AlertContainer({ alerts, removeAlert }) {
    const typeColors = {
        success: "bg-successGreen",
        error: "bg-errorRed",
        warning: "bg-orange-500",
        info: "bg-yellow-500",
    };

    return (
        <div className="fixed top-6 right-6 flex flex-col gap-3 z-50">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                        className={`text-white px-5 py-3 rounded-xl shadow-lg ${typeColors[alert.type]}`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold">{alert.message}</p>
                            <button
                                onClick={() => removeAlert(alert.id)}
                                className="text-white hover:opacity-70 text-lg font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
