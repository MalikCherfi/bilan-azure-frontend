export type ModuleContentType = 'CONTENT' | 'MOCK_EXAM';

export interface ModuleSummary {
  id: string;
  code: string;
  title: string;
  description: string | null;
  position: number;
  type: ModuleContentType;
  questionCount: number;
}
