export enum TaskStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    status_display: string;
    created_at: string;
    updated_at: string;
}

export interface AIResponse {
    original_command: string;
    interpreted_intent: {
        action: string;
        params: any;
        message?: string;
    };
    result: {
        success: boolean;
        message: string;
        task?: Task | any;
        tasks?: Task[];
    };
}
