import React, { ReactNode } from 'react';
import { useLocalization } from '../../context/LocalizationProvider.tsx';
import { LOCALES } from '../../constants.ts';

export const PageWrapper = ({ title, children }: { title: string, children: ReactNode }) => {
    const { t } = useLocalization();
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold text-[#001f3f] mb-6">{t(title as keyof typeof LOCALES.en)}</h1>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {children}
        </div>
      </div>
    );
};