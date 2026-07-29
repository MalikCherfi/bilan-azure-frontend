import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { QuizResult } from '../../core/models/quiz.model';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { QuizSessionStore } from '../../core/services/quiz-session.store';
import { Results } from './results';

const result: QuizResult = {
  sessionId: 'session-1',
  totalQuestions: 2,
  answeredCount: 2,
  correctCount: 1,
  scorePercentage: 50.4,
  details: [
    {
      questionId: 'q1',
      statement: 'Question 1',
      answered: true,
      correct: true,
      selectedOptionIds: ['o1'],
      correctOptionIds: ['o1'],
    },
    {
      questionId: 'q2',
      statement: 'Question 2',
      answered: true,
      correct: false,
      selectedOptionIds: ['o3'],
      correctOptionIds: ['o4'],
    },
  ],
};

describe('Results', () => {
  it('loads and rounds the score, then resets the session store', () => {
    const reset = vi.fn();
    TestBed.configureTestingModule({
      imports: [Results],
      providers: [
        provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ sessionId: 'session-1' }) } },
        },
        { provide: QuizSessionStore, useValue: { reset } },
        { provide: QuizApiService, useValue: { getResult: () => of(result) } },
      ],
    });

    const fixture = TestBed.createComponent(Results);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.loading()).toBe(false);
    expect(component.result()).toEqual(result);
    expect(component.scoreRounded()).toBe(50);
    expect(reset).toHaveBeenCalled();
  });
});
