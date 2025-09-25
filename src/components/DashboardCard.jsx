const DashboardCard = ({ title, count, onManage }) => {

    return (
        <button
            onClick={onManage}
            className="w-1/4 h-40 text-left bg-mainBlue rounded-2xl px-5 mr-4 py-3 flex flex-col justify-between hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <div className="flex justify-end">
                <div className="text-2xl font-semibold text-white">{count}</div>
            </div>
        </button>
    );
}

export default DashboardCard;