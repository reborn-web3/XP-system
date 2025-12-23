import { KanbanColumn, KanbanTask, TaskMetadata } from "./types";

/**
 * Extracts metadata from the raw task text.
 * Metadata format: xp:: 10, xp-applied:: true/false, parent:: [[Link]]
 */
export function extractTaskMetadata(line: string): { cleanedText: string; metadata: TaskMetadata } {
    let text = line;
    const metadata: TaskMetadata = {};

    // Extract XP
    const xpMatch = text.match(/xp::\s*(\d+)/);
    if (xpMatch && xpMatch[1]) {
        metadata.xp = parseInt(xpMatch[1], 10);
        text = text.replace(xpMatch[0], "").trim();
    }

    // Extract XP Applied
    const xpAppliedMatch = text.match(/xp-applied::\s*(true|false)/);
    if (xpAppliedMatch && xpAppliedMatch[1]) {
        metadata.xpApplied = xpAppliedMatch[1] === "true";
        text = text.replace(xpAppliedMatch[0], "").trim();
    }

    // Extract Parent
    const parentMatch = text.match(/parent::\s*(\[\[.*?\]\])/);
    if (parentMatch && parentMatch[1]) {
        metadata.parent = parentMatch[1];
        text = text.replace(parentMatch[0], "").trim();
    }

    // Clean up extra spaces
    text = text.replace(/\s{2,}/g, " ");

    return { cleanedText: text, metadata };
}

/**
 * Parses a markdown string into a Kanban structure.
 */
export function parseKanbanFile(content: string): KanbanColumn[] {
    const lines = content.split(/\r?\n/);
    const columns: KanbanColumn[] = [];
    let currentColumn: KanbanColumn | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // 1. Detect Header (Section)
        if (trimmedLine.startsWith("## ")) {
            const title = trimmedLine.replace(/^##\s+/, "").trim();
            currentColumn = {
                title,
                tasks: []
            };
            columns.push(currentColumn);
            continue;
        }

        // 2. Detect Task
        // Matches "- [ ] " or "- [x] " or "- [X] "
        const taskMatch = trimmedLine.match(/^- \[(x|X| )\]\s+(.*)/);
        if (taskMatch && currentColumn && taskMatch[2]) {
            const isCompleted = taskMatch[1]?.toLowerCase() === 'x';
            const rawText = taskMatch[2];

            const { cleanedText, metadata } = extractTaskMetadata(rawText);

            const task: KanbanTask = {
                id: rawText, // simple id for now
                text: cleanedText,
                completed: isCompleted,
                metadata: metadata,
                originalLine: line
            };

            currentColumn.tasks.push(task);
        }
    }

    return columns;
}

/**
 * Helper to find which section (column title) a task belongs to.
 * This is useful if you have a flat list of tasks and need to lookup their column,
 * or validation.
 */
export function detectTaskSection(taskId: string, columns: KanbanColumn[]): string | null {
    for (const column of columns) {
        if (column.tasks.some(t => t.id === taskId)) {
            return column.title;
        }
    }
    return null;
}
