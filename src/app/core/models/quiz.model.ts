export type QuizMode = 'MODULE' | 'EXAM';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface AnswerOption {
  optionId: string;
  label: string;
}

export interface QuizQuestion {
  questionId: string;
  statement: string;
  type: QuestionType;
  options: AnswerOption[];
}

export interface QuizSession {
  sessionId: string;
  mode: QuizMode;
  certificationId: string;
  moduleId: string | null;
  questions: QuizQuestion[];
}

export interface CreateQuizSessionRequest {
  mode: QuizMode;
  certificationId?: string;
  moduleId?: string;
  questionCount?: number;
}

export interface SubmitAnswerRequest {
  selectedOptionIds: string[];
}

export interface AnswerResult {
  correct: boolean;
  correctOptionIds: string[];
  explanation: string | null;
}

export interface QuestionResult {
  questionId: string;
  statement: string;
  answered: boolean;
  correct: boolean;
  selectedOptionIds: string[];
  correctOptionIds: string[];
}

export interface QuizResult {
  sessionId: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  details: QuestionResult[];
}
