import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { QuizResult } from '../../core/models/quiz.model';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { QuizSessionStore } from '../../core/services/quiz-session.store';

@Component({
  selector: 'app-results',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(QuizApiService);
  private readonly store = inject(QuizSessionStore);

  readonly result = signal<QuizResult | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly scoreRounded = signal(0);
  readonly scoreBand = signal<'good' | 'medium' | 'low'>('low');

  constructor() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    this.api.getResult(sessionId).subscribe({
      next: result => {
        this.result.set(result);
        const rounded = Math.round(result.scorePercentage);
        this.scoreRounded.set(rounded);
        this.scoreBand.set(rounded >= 70 ? 'good' : rounded >= 40 ? 'medium' : 'low');
        this.loading.set(false);
        this.store.reset();
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
