import { Client } from '@notionhq/client';
import { Competition } from '../types/competition';

export class NotionService {
  private notion: Client;
  private dataSourceId: string;

  constructor(dataSourceId: string) {
    this.dataSourceId = dataSourceId;
    
    const notionToken = process.env.NOTION_INTEGRATION_TOKEN;
    if (!notionToken) {
      throw new Error('NOTION_INTEGRATION_TOKEN environment variable is required');
    }
    
    this.notion = new Client({ auth: notionToken });
  }

  private parseDate(dateProperty: any): Date | undefined {
    if (!dateProperty || !dateProperty.date) {
      return undefined;
    }
    return new Date(dateProperty.date.start);
  }

  private parseMultiSelect(multiSelectProperty: any): string[] {
    if (!multiSelectProperty || !multiSelectProperty.multi_select) {
      return [];
    }
    return multiSelectProperty.multi_select.map((item: any) => item.name);
  }

  private parseSelect(selectProperty: any): string {
    if (!selectProperty || !selectProperty.select) {
      return '';
    }
    return selectProperty.select.name;
  }

  private parseTitle(titleProperty: any): string {
    if (!titleProperty || !titleProperty.title || titleProperty.title.length === 0) {
      return '';
    }
    return titleProperty.title[0].plain_text;
  }

  private parseRichText(richTextProperty: any): string {
    if (!richTextProperty || !richTextProperty.rich_text || richTextProperty.rich_text.length === 0) {
      return '';
    }
    return richTextProperty.rich_text[0].plain_text;
  }

  private parseNumber(numberProperty: any): number {
    if (!numberProperty || numberProperty.number === null) {
      return 0;
    }
    return numberProperty.number;
  }

  private parseUrl(urlProperty: any): string {
    if (!urlProperty || !urlProperty.url) {
      return '';
    }
    return urlProperty.url;
  }

  private convertNotionPageToCompetition(page: any): Competition {
    const properties = page.properties;
    
    return {
      id: page.id,
      url: page.url,
      name: this.parseTitle(properties['Competition Name']),
      application_deadline: this.parseDate(properties['Application Deadline']),
      competition_type: this.parseMultiSelect(properties['Competition Type']),
      estimated_effort: this.parseRichText(properties['Estimated Effort']),
      geographic_scope: this.parseRichText(properties['Geographic Scope']),
      industry_focus: this.parseMultiSelect(properties['Industry Focus']),
      priority_level: this.parseSelect(properties['Priority Level']),
      prize_amount: this.parseNumber(properties['Prize Amount']),
      stage_requirement: this.parseRichText(properties['Stage Requirement']),
      status: this.parseSelect(properties['Status']),
      success_probability: this.parseRichText(properties['Success Probability']),
      website: this.parseUrl(properties['Website'])
    };
  }

  async loadCompetitions(): Promise<Competition[]> {
    try {
      console.log('📊 Loading competitions from Notion database...');
      console.log(`🔑 Data Source ID: ${this.dataSourceId}`);
      
      // Use the new dataSources.query method
      const response = await this.notion.dataSources.query({
        data_source_id: this.dataSourceId,
        page_size: 100
      });

      console.log(`📈 Found ${response.results.length} competitions in Notion`);

      const competitions = response.results.map((page: any) => 
        this.convertNotionPageToCompetition(page)
      );

      return competitions;
    } catch (error) {
      console.error('❌ Error loading competitions from Notion:', error);
      // Return empty array instead of throwing to prevent bot crashes
      return [];
    }
  }

  async getCompetitionById(competitionId: string): Promise<Competition | null> {
    try {
      const page = await this.notion.pages.retrieve({ page_id: competitionId });
      return this.convertNotionPageToCompetition(page);
    } catch (error) {
      console.error(`❌ Error loading competition ${competitionId}:`, error);
      return null;
    }
  }
}

