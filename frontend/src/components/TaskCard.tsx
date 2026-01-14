import React from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { CheckCircle, Clock, Circle, Trash2, ArrowRight, Pencil, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
    task: Task;
    onStatusChange: (id: number, status: TaskStatus) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getStatusIcon = () => {
        switch (task.status) {
            case TaskStatus.COMPLETED:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case TaskStatus.IN_PROGRESS:
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getNextStatus = (): TaskStatus | null => {
        if (task.status === TaskStatus.NOT_STARTED) return TaskStatus.IN_PROGRESS;
        if (task.status === TaskStatus.IN_PROGRESS) return TaskStatus.COMPLETED;
        return null;
    };

    const nextStatus = getNextStatus();

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/70 hover:shadow-md transition-shadow duration-200",
                isDragging && "opacity-50 shadow-xl ring-2 ring-blue-500"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    {/* Drag Handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                        title="Drag to reorder"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="mt-1">{getStatusIcon()}</div>
                    <div className="flex-1">
                        <h3 className={clsx("font-medium text-lg", task.status === TaskStatus.COMPLETED && "text-gray-500 line-through")}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                        )}
                        <span className={clsx("inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium",
                            task.status === TaskStatus.COMPLETED ? "bg-green-100 text-green-700" :
                                task.status === TaskStatus.IN_PROGRESS ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-700"
                        )}>
                            {task.status_display}
                        </span>
                    </div>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                        title="Edit Task"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Task"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {nextStatus && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => onStatusChange(task.id, nextStatus)}
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Move to {nextStatus === TaskStatus.IN_PROGRESS ? "In Progress" : "Completed"}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
