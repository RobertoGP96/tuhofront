import { UhoContactInfo } from "../social/ContacUho"
import { Social } from "../social/Social"

export const AddFooter = () => {
    return <section className="w-full flex flex-row gap-4 justify-around items-start px-[10%] py-12 bg-secondary">
        <div><img src="/public/img/logo/svg/IdUHo-02.svg" width={200} alt="" />
            <h2 className="font-bold text-xl text-primary">"Espacio para crecer"</h2>
        </div>
        <UhoContactInfo />
        <Social />
    </section>
}