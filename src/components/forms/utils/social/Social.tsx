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
        }
    ]

    return <div className="flex flex-col gap-2 items-center">
        <h2 className="w-full uppercase" >Puede encontrarnos en:</h2>
        <div className="flex flex-row gap-3 justify-between items-center">
            {socialitems.map((e) =>{
                return <SocialChip item={e} />
            })}
        </div>
    </div>
}

const SocialChip = ({item}:{item:socialitem}) => {
    return <div className="p-2 flex justify-center items-center gap-3 -scale-50 transition w-[50px] h-[50px] border-4 border-white rounded-full text-white">
        <i className={item.icon}></i>
        <span>{item.label}</span>
    </div>
}