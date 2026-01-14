import React from 'react';
import { Task, TaskStatus } from '../types';
import { CheckCircle, Clock, Circle, Trash2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
    task: Task;
    onStatusChange: (id: number, status: TaskStatus) => void;
    onDelete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon()}</div>
                    <div>
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

                <button
                    onClick={() => onDelete(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Task"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
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
