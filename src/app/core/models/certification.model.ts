export interface CertificationSummary {
  id: string;
  code: string;
  title: string;
  description: string | null;
  position: number;
  moduleCount: number;
}
