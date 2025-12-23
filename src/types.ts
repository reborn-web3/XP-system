export interface TaskMetadata {
    xp?: number;
    xpApplied?: boolean;
    parent?: string; // Link like [[Project A]]
}

export interface KanbanTask {
    id: string; // Unique ID (hash or line content) - for now just the raw cleaned text
    text: string; // The text description of the task without metadata tags
    completed: boolean;
    metadata: TaskMetadata;
    originalLine: string; // To help with debugging or rewriting
}

export interface KanbanColumn {
    title: string;
    tasks: KanbanTask[];
}
