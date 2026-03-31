import React from "react";
import { PageTitle, SubtleText } from "../../components/ui/Typography";
import PageTransition from "../../components/ui/PageTransition";

const StoresPage: React.FC = () => {
  return (
    <PageTransition className="max-w-5xl mx-auto px-8 py-12">
      <header className="mb-6">
        <PageTitle className="text-2xl">Stores</PageTitle>
        <SubtleText>Coming soon</SubtleText>
      </header>
    </PageTransition>
  );
};

export default StoresPage;
