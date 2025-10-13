import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmDialog({
    visible,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-bgBlue text-white p-6 rounded-2xl w-96 border border-darkGray shadow-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-3">{title}</h2>
                        <p className="text-gray-300 mb-6">{message}</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="bg-errorRed hover:bg-red-700 px-4 py-2 rounded-lg transition"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
