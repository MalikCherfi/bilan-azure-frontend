import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { CertificationSummary } from '../../core/models/certification.model';
import { QuizApiService } from '../../core/services/quiz-api.service';

@Component({
  selector: 'app-certification-list',
  imports: [RouterLink, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './certification-list.html',
  styleUrl: './certification-list.scss',
})
export class CertificationList {
  private readonly api = inject(QuizApiService);

  readonly certifications = signal<CertificationSummary[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  constructor() {
    this.api.getCertifications().subscribe({
      next: certifications => {
        this.certifications.set(certifications);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
