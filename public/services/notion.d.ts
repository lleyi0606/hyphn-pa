import { Competition } from '../types/competition';
export declare class NotionService {
    private notion;
    private databaseId;
    constructor(databaseId: string);
    private parseDate;
    private parseMultiSelect;
    private parseSelect;
    private parseTitle;
    private parseRichText;
    private parseNumber;
    private parseUrl;
    private convertNotionPageToCompetition;
    loadCompetitions(): Promise<Competition[]>;
    getCompetitionById(competitionId: string): Promise<Competition | null>;
}
//# sourceMappingURL=notion.d.ts.map