import { Competition } from '../types/competition';
export declare class CompetitionService {
    private notionService;
    constructor(notionDatabaseId: string);
    getCompetitions(): Promise<Competition[]>;
    getUpcomingDeadlines(daysAhead?: number): Promise<Competition[]>;
    getHighPriorityCompetitions(): Promise<Competition[]>;
    formatCompetitionSummary(competition: Competition): string;
    generateDashboard(): Promise<string>;
    private formatPrize;
    generateWhatToDoRecommendations(): Promise<string>;
}
//# sourceMappingURL=competition.d.ts.map