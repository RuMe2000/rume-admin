import { useState } from "react";

export default function useAlerts() {
    const [alerts, setAlerts] = useState([]);

    const showAlert = (type, message, duration = 3000) => {
        const id = Date.now();
        setAlerts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setAlerts((prev) => prev.filter((a) => a.id !== id));
        }, duration);
    };

    const removeAlert = (id) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return { alerts, showAlert, removeAlert };
}
