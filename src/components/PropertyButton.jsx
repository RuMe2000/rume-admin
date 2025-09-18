export const AllPropertyButton = ({ count, onManage }) => {

    return (
        <button
        onClick={onManage}
        className="w-80 h-55 text-left bg-mainBlue rounded-xl px-5 mr-5 py-3 flex flex-col justify-between  hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer">
            <h2 className="text-3xl font-bold text-white">All</h2>
            <div className="flex justify-end">
                <div className="text-3xl font-semibold text-white">{count}</div>
            </div>
        </button>
    )
}

export const StatusPropertyButton = ({ statusName, count, onManage }) => {

    return (
        <button
            onClick={onManage}
            className="w-80 h-55 text-left bg-mainBlue rounded-xl px-5 mr-5 py-3 flex flex-col justify-between hover:bg-hoverBlue hover:scale-105 transition duration-300 cursor-pointer">
            <h2 className="text-3xl font-bold text-white">{statusName}</h2>
            <div className="flex justify-end">
                <div className="text-2xl font-semibold text-white">{count}</div>
            </div>
        </button>
    );
}