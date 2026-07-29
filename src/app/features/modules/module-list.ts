import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { ModuleSummary } from '../../core/models/module.model';
import { CreateQuizSessionRequest, QuizSession } from '../../core/models/quiz.model';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { QuizSessionStore } from '../../core/services/quiz-session.store';

@Component({
  selector: 'app-module-list',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './module-list.html',
  styleUrl: './module-list.scss',
})
export class ModuleList {
  private readonly api = inject(QuizApiService);
  private readonly store = inject(QuizSessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly certificationId = this.route.snapshot.paramMap.get('certificationId')!;
  readonly modules = signal<ModuleSummary[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly starting = signal(false);
  readonly startError = signal(false);

  readonly contentModules = computed(() => this.modules().filter(m => m.type === 'CONTENT'));
  readonly mockExamModules = computed(() => this.modules().filter(m => m.type === 'MOCK_EXAM'));

  constructor() {
    this.api.getModules(this.certificationId).subscribe({
      next: modules => {
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  startModuleQuiz(moduleId: string): void {
    this.startSession({ mode: 'MODULE', moduleId });
  }

  startExam(): void {
    this.startSession({ mode: 'EXAM', certificationId: this.certificationId });
  }

  private startSession(request: CreateQuizSessionRequest): void {
    this.starting.set(true);
    this.startError.set(false);
    this.api.createSession(request).subscribe({
      next: (session: QuizSession) => {
        this.store.start(session);
        this.starting.set(false);
        this.navigateToQuiz(request);
      },
      error: () => {
        this.starting.set(false);
        this.startError.set(true);
      },
    });
  }

  private navigateToQuiz(request: CreateQuizSessionRequest): void {
    if (request.mode === 'MODULE') {
      this.router.navigate([
        '/certifications',
        this.certificationId,
        'quiz',
        'module',
        request.moduleId,
      ]);
    } else {
      this.router.navigate(['/certifications', this.certificationId, 'quiz', 'exam']);
    }
  }
}
