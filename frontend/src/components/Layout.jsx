import React from 'react';

const Layout = ({ children }) => {
    return (
        <div
            className="h-screen text-gray-900 font-sans relative overflow-hidden flex flex-col"
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#f9fafb'
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 backdrop-blur-[0.5px] bg-white/40 pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
                <header className="bg-white/95 backdrop-blur-sm shadow-sm flex-none border-b border-gray-200/50">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-lg md:text-xl font-bold text-blue-600 flex items-center gap-2">
                            Task Management System AI-Powered
                        </h1>
                    </div>
                </header>
                <main className="flex-1 overflow-hidden w-full max-w-5xl mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
