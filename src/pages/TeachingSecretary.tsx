
import React, { type JSX } from "react";
import { useParams } from "react-router";

import { UnderInter } from "../components/teaching_secretary/undergraduate/International";
import { UnderNat } from "../components/teaching_secretary/undergraduate/National";
import { PostInter } from "../components/teaching_secretary/postgraduate/International";
import { PostNat } from "../components/teaching_secretary/postgraduate/National";
import { TitleLegalization } from "../components/teaching_secretary/TitleLegalization";

export const TeachingSecretary: React.FC = () => {

    const { id } = useParams();

    const getTemplate = (): JSX.Element => {
        switch (id) {
            case "undernat":
                return <UnderNat />;
            case "underinter":
                return <UnderInter />;
            case "postnat":
                return <PostNat />;
            case "postinter":
                return <PostInter />;
            case "legaliz":
                return <TitleLegalization />;
            default:
                return <div>No template found for this city.</div>; // Manejo de caso por defecto
        }
    };

    return <section className="secretary flex flex-col flex-nowrap gap-2 backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[15%] pt-8">
        {(getTemplate())}
    </section>
}