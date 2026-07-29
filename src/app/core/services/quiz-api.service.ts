import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CertificationSummary } from '../models/certification.model';
import { ModuleSummary } from '../models/module.model';
import {
  AnswerResult,
  CreateQuizSessionRequest,
  QuizResult,
  QuizSession,
  SubmitAnswerRequest,
} from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getCertifications(): Observable<CertificationSummary[]> {
    return this.http.get<CertificationSummary[]>(`${this.baseUrl}/certifications`);
  }

  getModules(certificationId: string): Observable<ModuleSummary[]> {
    return this.http.get<ModuleSummary[]>(
      `${this.baseUrl}/certifications/${certificationId}/modules`
    );
  }

  createSession(request: CreateQuizSessionRequest): Observable<QuizSession> {
    return this.http.post<QuizSession>(`${this.baseUrl}/quiz-sessions`, request);
  }

  submitAnswer(
    sessionId: string,
    questionId: string,
    request: SubmitAnswerRequest
  ): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(
      `${this.baseUrl}/quiz-sessions/${sessionId}/questions/${questionId}/answer`,
      request
    );
  }

  getResult(sessionId: string): Observable<QuizResult> {
    return this.http.get<QuizResult>(`${this.baseUrl}/quiz-sessions/${sessionId}/result`);
  }
}
