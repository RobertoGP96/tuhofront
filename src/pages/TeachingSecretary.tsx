import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { PostInterProcedure } from './procedures/PostInterProcedure';
import { PostNatProcedure } from './procedures/PostNatProcedure';
import { TitleLegalization } from './procedures/TitleLegalization';
import { UnderInterProcedure } from './procedures/UnderInterProcedure';
import { UnderNatProcedure } from './procedures/UnderNatProcedure';

// Main layout component
const ProcedureLayout = ({ children }: { children: React.ReactNode }) => (
  <section className="secretary flex flex-col flex-nowrap gap-2 backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2 border-gray-300 px-[15%] pt-8">
    {children}
  </section>
);

// Individual procedure route components
const UnderInterRoute = () => (
  <ProcedureLayout>
    <UnderInterProcedure />
  </ProcedureLayout>
);

const UnderNatRoute = () => (
  <ProcedureLayout>
    <UnderNatProcedure />
  </ProcedureLayout>
);

const PostInterRoute = () => (
  <ProcedureLayout>
    <PostInterProcedure />
  </ProcedureLayout>
);

const PostNatRoute = () => (
  <ProcedureLayout>
    <PostNatProcedure />
  </ProcedureLayout>
);

const LegalizationRoute = () => (
  <ProcedureLayout>
    <TitleLegalization />
  </ProcedureLayout>
);

// Main component with routes
export const TeachingSecretary: React.FC = () => {
  return (
    <Routes>
      <Route path="underinter" element={<UnderInterRoute />} />
      <Route path="undernat" element={<UnderNatRoute />} />
      <Route path="postinter" element={<PostInterRoute />} />
      <Route path="postnat" element={<PostNatRoute />} />
      <Route path="legaliz" element={<LegalizationRoute />} />
      <Route index element={<LegalizationRoute />} />
    </Routes>
  );
};