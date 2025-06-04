type ChipAdminProps = {
    label: string,
    cuantity: string,
    icon: string,
}

export const ChipAdminInfo: React.FC<ChipAdminProps> = ({ label, cuantity, icon }) => {
    return <div className="relative p-4 flex flex-col gap-2 border-4 border-primary/40 rounded-xl  overflow-hidden">
        <h2 className="text-primary font-bold uppercase text-2xs">{label}</h2>
        <p className="text-primary/75 font-bold text-xl">{cuantity}</p>
        <div className=" text-primary/50 absolute scale-100 right-2 bottom-2">
            <i className={icon}></i>
        </div>
    </div>
}