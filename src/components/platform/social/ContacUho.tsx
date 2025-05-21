
export const UhoContactInfo = () => {

    return <div className="flex flex-col gap-2 items-center border-l-4  border-primary pl-3">
        <h2 className="w-full uppercase text-xl text-primary font-bold text-start" >Puede encontrarnos en:</h2>
        <ul className="w-full px-3 flex flex-col justify-start items-center gap-1 pl-3  pt-1 text-sm">
            <li className="w-full flex flex-row justify-start items-center text-primary gap-3"><i className="pi pi-map-marker"></i><span>Ave. XX Aniversario. Piedra Blanca. Holguín. Cuba</span></li>
            <li className="w-full flex flex-row justify-start items-center text-primary gap-3"><i className="pi pi-phone"></i><span>+53 24425555</span></li>
            <li className="w-full flex flex-row justify-start items-center text-primary gap-3"><i className="pi pi-envelope"></i><span>uho@uho.edu.cu</span></li>
            <li className="w-full flex flex-row justify-start items-center text-primary gap-3"><i className=""></i><span></span></li>
        </ul>
    </div>
}
