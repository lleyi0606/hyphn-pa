import { Competition } from '../types/competition';
export declare class NotionService {
    private dataSourceId;
    constructor(dataSourceId: string);
    private callNotionMCP;
    private extractPropertiesFromPage;
    private parseNotionDate;
    private parseMultiSelect;
    loadCompetitions(): Promise<Competition[]>;
}
//# sourceMappingURL=notion.d.ts.map