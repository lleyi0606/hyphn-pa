import { Competition } from '../types/competition';
export declare class NotionService {
    private dataSourceId;
    private manusApiKey;
    private baseUrl;
    constructor(dataSourceId: string);
    private createManusTask;
    loadCompetitions(): Promise<Competition[]>;
}
//# sourceMappingURL=notion.d.ts.map