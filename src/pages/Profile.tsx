import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";

export const Profile: React.FC = () => {
    const items = [
        { label: 'Perfil', icon: 'pi pi-user' },
        { label: 'Mis Trámites', icon: 'pi pi-chart-line' },
    ];

    const [view, setView] = useState();
    
    const [userInfo, setUserInfo] = useState({
    });
    const [edit, setEdit]= useState<boolean>(true)

    return <section className="secretary flex flex-col flex-nowrap backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[15%] pt-8">

        <div className="flex flex-row px-2 justify-start items-center bg-white w-full">
            <TabMenu className="w-full" model={items} />
        </div>
        <div className="w-full flex flex-row gap-6 grow min-h-[60dvh]  bg-white  px-8 py-8">

            <div className="max-h-[100px] aspect-square p-6 border-4 border-secondary rounded-2xl">
                <Avatar shape="square" label="U" size="large"/>
            </div>
            <div className="flex flex-col gap-4 w-full">
                <h3 className=" w-full uppercase mb-3 font-bold text-primary text-xl"> Información del Usuario</h3>
                <div className="w-full flex flex-row gap-4 flex-nowrap">
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="username">Nombres:</label>
                        <InputText id="username" aria-describedby="username-help" placeholder="Escriba su nombre." disabled={edit} value={"Username"} />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="lastname">Apellidos:</label>
                        <InputText id="lastname" aria-describedby="lastname-help" placeholder="Escriba sus apellidos." disabled={edit} value={"Lastname"} />

                    </div>

                </div>
                <div className="w-full flex flex-row gap-4 flex-nowrap">
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="id">Carnet de Identidad:</label>
                        <InputText id="id" aria-describedby="id-help" placeholder="Escriba su número de carnet." disabled={edit} value={"99051117934"} />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="addres">Dirección:</label>
                        <InputText id="addres" aria-describedby="addres-help" placeholder="%" disabled={edit} value={"Calle Carbo % Ruben Bravo y Ave. Cap. Urbino #3F"} />
                    </div>
                </div>

                <div className="w-full flex flex-row gap-4 flex-nowrap">
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="email">Correo:</label>
                        <InputText id="email" aria-describedby="email-help" value="nombre.apellido@uho.cu"  disabled={edit}/>

                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="phone">Teléfono:</label>
                        <InputText id="phone" aria-describedby="phone-help" placeholder="(+53)..." disabled={edit} value={"+53555555"}/>
                    </div>

                </div>
                <div className=" flex flex-row justify-end items-center p-3 gap-2">
                    <Button className="btn-primary" icon="pi pi-pencil" label="Editar" onClick={()=>setEdit(!edit)} />
                </div>
            </div>

        </div>
    </section>
}

