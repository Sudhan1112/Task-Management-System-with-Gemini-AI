import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        ✨ GeminiTask
                    </h1>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
