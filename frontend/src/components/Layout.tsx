import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div
            className="min-h-screen text-gray-900 font-sans relative"
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#f9fafb'
            }}
        >
            {/* Overlay for better content readability */}
            <div className="min-h-screen backdrop-blur-[0.5px] bg-white/40">
                <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-200/50">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-lg md:text-xl font-bold text-blue-600 flex items-center gap-2">
                            Task Management System AI-Powered
                        </h1>
                    </div>
                </header>
                <main className="max-w-5xl mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
