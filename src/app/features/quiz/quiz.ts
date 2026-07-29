import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';

import { CreateQuizSessionRequest } from '../../core/models/quiz.model';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { QuizSessionStore } from '../../core/services/quiz-session.store';

@Component({
  selector: 'app-quiz',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    TranslatePipe,
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(QuizApiService);
  private readonly store = inject(QuizSessionStore);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal(false);
  readonly selectedOptionIds = signal<string[]>([]);

  readonly session = this.store.session;
  readonly currentQuestion = this.store.currentQuestion;
  readonly lastResult = this.store.lastResult;
  readonly isLastQuestion = this.store.isLastQuestion;
  readonly progressPercent = this.store.progressPercent;
  readonly currentIndexDisplay = computed(() => this.store.currentIndex() + 1);
  readonly totalQuestions = computed(() => this.session()?.questions.length ?? 0);

  constructor() {
    const certificationId = this.route.snapshot.paramMap.get('certificationId')!;
    const moduleId = this.route.snapshot.paramMap.get('moduleId');

    const existing = this.store.session();
    const matchesRoute =
      existing !== null &&
      existing.certificationId === certificationId &&
      existing.moduleId === moduleId;

    if (matchesRoute) {
      this.loading.set(false);
      return;
    }

    const request: CreateQuizSessionRequest = moduleId
      ? { mode: 'MODULE', moduleId }
      : { mode: 'EXAM', certificationId };

    this.api.createSession(request).subscribe({
      next: session => {
        this.store.start(session);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  toggleOption(optionId: string, isMultiple: boolean): void {
    this.selectedOptionIds.update(ids => {
      if (isMultiple) {
        return ids.includes(optionId) ? ids.filter(id => id !== optionId) : [...ids, optionId];
      }
      return [optionId];
    });
  }

  isSelected(optionId: string): boolean {
    return this.selectedOptionIds().includes(optionId);
  }

  isCorrectOption(optionId: string): boolean {
    return this.lastResult()?.correctOptionIds.includes(optionId) ?? false;
  }

  isWrongSelection(optionId: string): boolean {
    return this.lastResult() !== null && this.isSelected(optionId) && !this.isCorrectOption(optionId);
  }

  submit(): void {
    if (this.selectedOptionIds().length === 0) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    this.store.submitAnswer(this.selectedOptionIds()).subscribe({
      next: () => this.submitting.set(false),
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }

  next(): void {
    this.selectedOptionIds.set([]);
    if (this.isLastQuestion()) {
      const sessionId = this.session()!.sessionId;
      this.router.navigate(['/results', sessionId]);
    } else {
      this.store.goToNextQuestion();
    }
  }
}
