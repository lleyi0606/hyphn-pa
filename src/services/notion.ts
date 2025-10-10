import { exec } from 'child_process';
import { promisify } from 'util';
import { Competition, NotionSearchResult, NotionPageData, NotionPageProperties } from '../types/competition';

const execAsync = promisify(exec);

export class NotionService {
  private dataSourceId: string;

  constructor(dataSourceId: string) {
    this.dataSourceId = dataSourceId;
  }

  private async callNotionMCP(toolName: string, inputData: any): Promise<any> {
    try {
      const inputJson = JSON.stringify(inputData);
      const command = `manus-mcp-cli tool call ${toolName} --server notion --input '${inputJson}'`;
      
      const { stdout } = await execAsync(command);
      const resultStart = stdout.indexOf('Tool execution result:\n');
      
      if (resultStart === -1) {
        throw new Error('No result found in MCP output');
      }
      
      const resultJson = stdout.substring(resultStart + 'Tool execution result:\n'.length);
      return JSON.parse(resultJson);
    } catch (error) {
      console.error(`MCP tool call failed: ${error}`);
      return {};
    }
  }

  private extractPropertiesFromPage(pageText: string): Competition | null {
    try {
      if (!pageText.includes('<properties>') || !pageText.includes('</properties>')) {
        return null;
      }

      const propertiesStart = pageText.indexOf('<properties>') + '<properties>'.length;
      const propertiesEnd = pageText.indexOf('</properties>');
      const propertiesText = pageText.substring(propertiesStart, propertiesEnd).trim();
      
      const properties: NotionPageProperties = JSON.parse(propertiesText);
      
      return {
        id: '',
        url: '',
        name: properties['Competition Name'] || '',
        application_deadline: this.parseNotionDate(properties['date:Application Deadline:start']),
        competition_type: this.parseMultiSelect(properties['Competition Type']),
        estimated_effort: properties['Estimated Effort'] || '',
        geographic_scope: properties['Geographic Scope'] || '',
        industry_focus: this.parseMultiSelect(properties['Industry Focus']),
        priority_level: properties['Priority Level'] || '',
        prize_amount: properties['Prize Amount'] || 0,
        stage_requirement: properties['Stage Requirement'] || '',
        status: properties['Status'] || '',
        success_probability: properties['Success Probability'] || '',
        website: properties['Website'] || ''
      };
    } catch (error) {
      console.error('Error extracting properties:', error);
      return null;
    }
  }

  private parseNotionDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    
    try {
      if (dateStr.includes('T')) {
        return new Date(dateStr.replace('Z', '+00:00'));
      } else {
        return new Date(dateStr);
      }
    } catch {
      return undefined;
    }
  }

  private parseMultiSelect(value: string): string[] {
    if (!value) return [];
    
    try {
      if (value.startsWith('[') && value.endsWith(']')) {
        return JSON.parse(value);
      } else {
        return value ? [value] : [];
      }
    } catch {
      return value ? [value] : [];
    }
  }

  async loadCompetitions(): Promise<Competition[]> {
    try {
      const searchResult: NotionSearchResult = await this.callNotionMCP('notion-search', {
        query: 'competition',
        data_source_url: `collection://${this.dataSourceId}`
      });

      if (!searchResult.results) {
        console.warn('No competitions found in Notion database');
        return [];
      }

      const competitions: Competition[] = [];

      for (const result of searchResult.results) {
        // Skip reminder entries
        if (result.title.toLowerCase().includes('reminder')) {
          continue;
        }

        const pageData: NotionPageData = await this.callNotionMCP('notion-fetch', {
          id: result.url
        });

        if (pageData.metadata?.type === 'page') {
          const competition = this.extractPropertiesFromPage(pageData.text);
          if (competition) {
            competition.id = result.id;
            competition.url = result.url;
            competitions.push(competition);
          }
        }
      }

      console.log(`Loaded ${competitions.length} competitions from Notion database`);
      return competitions;
    } catch (error) {
      console.error('Error loading competitions from Notion:', error);
      return [];
    }
  }
}
