export interface ManusTaskResponse {
    task_id: string;
    task_title: string;
    task_url: string;
    share_url?: string;
}
export interface ManusTaskRequest {
    prompt: string;
    attachments?: Array<{
        filename?: string;
        url?: string;
        mimeType?: string;
        fileData?: string;
    }>;
    taskMode: string;
    connectors: string[];
    hideInTaskList?: boolean;
    createShareableLink?: boolean;
    taskId?: string;
    agentProfile: string;
}
export declare class ManusService {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    createTask(request: ManusTaskRequest): Promise<ManusTaskResponse>;
    createCompetitionExtractionTask(competitionInfo: string, attachments?: Array<{
        filename?: string;
        url?: string;
        mimeType?: string;
        fileData?: string;
    }>): Promise<ManusTaskResponse>;
    createCompetitionReplyTask(competitionInfo: string, taskId: string): Promise<ManusTaskResponse>;
}
//# sourceMappingURL=manus.d.ts.map