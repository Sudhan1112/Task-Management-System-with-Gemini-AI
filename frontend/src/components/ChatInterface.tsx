import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { sendAICommand } from '../services/api';

interface ChatInterfaceProps {
    onCommandExecuted: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onCommandExecuted }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<{ success: boolean, message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setResponse(null);
        try {
            const res = await sendAICommand(input);
            if (res.result) {
                setResponse({
                    success: res.result.success,
                    message: res.result.message
                });
                if (res.result.success) {
                    onCommandExecuted();
                    setInput('');
                }
            } else if (res.error) {
                setResponse({ success: false, message: res.error });
            }
        } catch (error: any) {
            setResponse({ success: false, message: "Failed to connect to AI service." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-3 text-blue-600 font-medium">
                <Sparkles className="w-5 h-5" />
                <h2>AI Assistant</h2>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini to create or manage tasks..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 pr-10 min-h-[100px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute bottom-3 right-3 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>

            {response && (
                <div className={`mt-3 text-sm p-3 rounded-lg ${response.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {response.message}
                </div>
            )}

            <div className="mt-4 text-xs text-gray-400">
                <p className="font-medium mb-1">Try asking:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>"Add a task to buy groceries"</li>
                    <li>"Show me all completed tasks"</li>
                    <li>"Start working on the presentation"</li>
                </ul>
            </div>
        </div>
    );
};

export default ChatInterface;
