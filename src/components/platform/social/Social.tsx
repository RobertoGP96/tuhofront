type socialitem = {
    icon: string,
    label: string
}

export const Social = () => {

    const socialitems: socialitem[] = [
        {
            icon: "pi pi-facebook",
            label: "Facebook"
        },
        {
            icon: "pi pi-instagram",
            label: "Instagram"
        },
        {
            icon: "pi pi-youtube",
            label: "Youtube"
        },
        {
            icon: "pi pi-twitter",
            label: "Instagram"
        }
    ]

    return <div className="flex flex-col gap-2 items-start justify-start">
        <h2 className="w-full uppercase text-xl text-primary font-bold text-start">Redes:</h2>
        <div className="flex flex-row gap-3 justify-between items-center pl-2">
            {socialitems.map((e) =>{
                return <SocialChip item={e} />
            })}
        </div>
    </div>
}

const SocialChip = ({item}:{item:socialitem}) => {
    return <div className="p-2 flex justify-center items-center gap-3 transition bg-transparent rounded-xl text-white group border-primary border-2 hover:scale-110 hover:bg-secondary cursor-pointer">
        <i className={item.icon+" text-primary  transition group-hover:scale-120 "}></i>
        <span className="hidden">{item.label}</span>
    </div>
}