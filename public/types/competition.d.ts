export interface Competition {
    id: string;
    url: string;
    name: string;
    application_deadline?: Date;
    competition_type: string[];
    estimated_effort: string;
    geographic_scope: string;
    industry_focus: string[];
    priority_level: string;
    prize_amount: number;
    stage_requirement: string;
    status: string;
    success_probability: string;
    website: string;
}
export interface NotionPageProperties {
    'Competition Name': string;
    'date:Application Deadline:start'?: string;
    'Competition Type': string;
    'Estimated Effort': string;
    'Geographic Scope': string;
    'Industry Focus': string;
    'Priority Level': string;
    'Prize Amount': number;
    'Stage Requirement': string;
    'Status': string;
    'Success Probability': string;
    'Website': string;
}
export interface NotionSearchResult {
    results: Array<{
        id: string;
        url: string;
        title: string;
        highlight: string;
        timestamp: string;
        type: string;
    }>;
    type: string;
}
export interface NotionPageData {
    metadata: {
        type: string;
    };
    title: string;
    url: string;
    text: string;
}
//# sourceMappingURL=competition.d.ts.map