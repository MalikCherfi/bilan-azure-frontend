import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { CertificationSummary } from '../../core/models/certification.model';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { CertificationList } from './certification-list';

const certifications: CertificationSummary[] = [
  {
    id: 'cert-1',
    code: 'AZ-900',
    title: 'Microsoft Azure Fundamentals',
    description: null,
    position: 1,
    moduleCount: 3,
  },
];

describe('CertificationList', () => {
  it('loads certifications on init', () => {
    TestBed.configureTestingModule({
      imports: [CertificationList],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
        { provide: QuizApiService, useValue: { getCertifications: () => of(certifications) } },
      ],
    });

    const fixture = TestBed.createComponent(CertificationList);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.loading()).toBe(false);
    expect(component.certifications()).toEqual(certifications);
  });
});
