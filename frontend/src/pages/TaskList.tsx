import React, { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus, deleteTask, createTask, updateTask } from '../services/api';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import TaskCard from '../components/TaskCard';
import ChatInterface from '../components/ChatInterface';
import { Plus, X } from 'lucide-react';
import Layout from '../components/Layout';
import TaskEditModal from '../components/TaskEditModal';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Requires 8px movement to start dragging
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchTasks = async () => {
        try {
            const data = await getTasks(filter === 'ALL' ? undefined : filter);
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filter]);

    const handleStatusChange = async (id: number, status: TaskStatus) => {
        try {
            await updateTaskStatus(id, status);
            fetchTasks();
        } catch (error) {
            alert("Failed to update status. Check transition rules.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure?")) {
            await deleteTask(id);
            fetchTasks();
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTask(newTaskTitle, newTaskDesc);
            setNewTaskTitle('');
            setNewTaskDesc('');
            setIsModalOpen(false);
            fetchTasks();
        } catch (error) {
            alert("Failed to create task");
        }
    }

    const handleEdit = (task: Task) => {
        setEditingTask(task);
    };

    const handleSaveEdit = async (title: string, description: string) => {
        if (!editingTask) return;
        try {
            await updateTask(editingTask.id, title, description);
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            alert("Failed to update task");
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <Layout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Main Content */}
                <div className="lg:col-span-2 h-full flex flex-col min-h-0">
                    <div className="flex-none space-y-6 mb-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                New Task
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm ${filter === f
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white/90 backdrop-blur-sm border border-gray-200/70 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Task Grid with Drag and Drop - SCROLLABLE AREA */}
                    <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={tasks.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid gap-4">
                                    {tasks.length === 0 ? (
                                        <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500">No tasks found. Create one or ask AI Assistant!</p>
                                        </div>
                                    ) : (
                                        tasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onStatusChange={handleStatusChange}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Sidebar (AI) */}
                <div className="lg:col-span-1 h-full overflow-y-auto pb-4">
                    <ChatInterface onCommandExecuted={fetchTasks} />
                </div>
            </div>

            {/* Manual Create Modal (Simple) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">New Task</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Finish report"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newTaskDesc}
                                    onChange={e => setNewTaskDesc(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="Optional details..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTask && (
                <TaskEditModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </Layout>
    );
};

export default TaskList;
