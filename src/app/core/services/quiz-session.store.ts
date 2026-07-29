import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AnswerResult, QuizSession } from '../models/quiz.model';
import { QuizApiService } from './quiz-api.service';

@Injectable({ providedIn: 'root' })
export class QuizSessionStore {
  private readonly api = inject(QuizApiService);

  readonly session = signal<QuizSession | null>(null);
  readonly currentIndex = signal(0);
  readonly lastResult = signal<AnswerResult | null>(null);
  readonly answeredQuestionIds = signal<ReadonlySet<string>>(new Set());

  readonly currentQuestion = computed(() => {
    const session = this.session();
    return session ? (session.questions[this.currentIndex()] ?? null) : null;
  });

  readonly isLastQuestion = computed(() => {
    const session = this.session();
    return session ? this.currentIndex() === session.questions.length - 1 : false;
  });

  readonly progressPercent = computed(() => {
    const session = this.session();
    if (!session || session.questions.length === 0) {
      return 0;
    }
    return ((this.currentIndex() + 1) / session.questions.length) * 100;
  });

  start(session: QuizSession): void {
    this.session.set(session);
    this.currentIndex.set(0);
    this.lastResult.set(null);
    this.answeredQuestionIds.set(new Set());
  }

  submitAnswer(selectedOptionIds: string[]): Observable<AnswerResult> {
    const session = this.session();
    const question = this.currentQuestion();
    if (!session || !question) {
      throw new Error('No active question to answer');
    }
    return this.api.submitAnswer(session.sessionId, question.questionId, { selectedOptionIds }).pipe(
      tap(result => {
        this.lastResult.set(result);
        this.answeredQuestionIds.update(ids => new Set(ids).add(question.questionId));
      })
    );
  }

  goToNextQuestion(): void {
    this.lastResult.set(null);
    this.currentIndex.update(index => index + 1);
  }

  reset(): void {
    this.session.set(null);
    this.currentIndex.set(0);
    this.lastResult.set(null);
    this.answeredQuestionIds.set(new Set());
  }
}
