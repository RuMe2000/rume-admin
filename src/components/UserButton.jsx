const UserButton = ({ roleName, count, onManage }) => {
    // Determine background color based on role
    const bgClass = roleName.toLowerCase() === "admins" ? "bg-blue-900" : "bg-mainBlue";
    // const hoverClass = roleName.toLowerCase() === "admin" ? "hover:bg-blue-800" : "hover:bg-hoverBlue";

    return (
        <button
            onClick={onManage}
            className={`w-[45vh] h-[25vh] text-left ${bgClass} rounded-2xl shadow-xl shadow-bgBlue px-5 py-3 flex flex-col justify-between hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer`}
        >
            <h2 className="text-3xl font-bold text-white">{roleName}</h2>
            <div className="flex justify-end">
                <div className="text-3xl font-semibold text-white">{count}</div>
            </div>
        </button>
    );
};

export default UserButton;
