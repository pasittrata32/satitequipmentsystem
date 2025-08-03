import React from 'react';

export const LoadingIndicator = ({ text }: { text: string }) => {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#001f3f] rounded-full animate-pulse-dots" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-[#001f3f] rounded-full animate-pulse-dots" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-[#001f3f] rounded-full animate-pulse-dots" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="mt-4 text-lg text-gray-700">{text}</p>
        </div>
    );
};
