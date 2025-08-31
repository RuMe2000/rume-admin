const UserButton = ({ roleName, count, onManage }) => {

    return (
        <button
            onClick={onManage}
            className="w-1/4 h-50 text-left bg-mainBlue rounded-xl px-5 mr-5 py-3 flex flex-col justify-between hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer">
            <h2 className="text-3xl font-bold text-white">{roleName}</h2>
            <div className="flex justify-end">
                <div className="text-2xl font-semibold text-white">{count}</div>
            </div>
        </button>
    );
}

export default UserButton;