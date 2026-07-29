import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { QuizSession } from '../../core/models/quiz.model';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { QuizSessionStore } from '../../core/services/quiz-session.store';
import { Quiz } from './quiz';

const session: QuizSession = {
  sessionId: 'session-1',
  mode: 'MODULE',
  certificationId: 'cert-1',
  moduleId: 'module-1',
  questions: [
    {
      questionId: 'q1',
      statement: 'Question 1',
      type: 'SINGLE_CHOICE',
      options: [
        { optionId: 'o1', label: 'Option 1' },
        { optionId: 'o2', label: 'Option 2' },
      ],
    },
  ],
};

function setup(storeOverrides: Record<string, unknown> = {}, apiOverrides: Record<string, unknown> = {}) {
  const navigate = vi.fn();

  TestBed.configureTestingModule({
    imports: [Quiz],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: convertToParamMap({ certificationId: 'cert-1', moduleId: 'module-1' }),
          },
        },
      },
      { provide: Router, useValue: { navigate } },
      {
        provide: QuizSessionStore,
        useValue: {
          session: () => null,
          currentQuestion: () => null,
          lastResult: () => null,
          isLastQuestion: () => false,
          progressPercent: () => 0,
          currentIndex: () => 0,
          start: vi.fn(),
          submitAnswer: vi.fn(),
          goToNextQuestion: vi.fn(),
          ...storeOverrides,
        },
      },
      {
        provide: QuizApiService,
        useValue: {
          createSession: () => of(session),
          ...apiOverrides,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(Quiz);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, navigate };
}

describe('Quiz', () => {
  it('creates a new session when none matches the current route', () => {
    const start = vi.fn();
    const { component } = setup({ start });

    expect(start).toHaveBeenCalledWith(session);
    expect(component.loading()).toBe(false);
  });

  it('reuses the store session when it already matches the route', () => {
    const start = vi.fn();
    const createSession = vi.fn();
    const { component } = setup({ session: () => session, start }, { createSession });

    expect(start).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('replaces the single selection when toggling a single-choice option', () => {
    const { component } = setup();

    component.toggleOption('o1', false);
    component.toggleOption('o2', false);

    expect(component.selectedOptionIds()).toEqual(['o2']);
  });

  it('accumulates selections for multiple-choice options', () => {
    const { component } = setup();

    component.toggleOption('o1', true);
    component.toggleOption('o2', true);

    expect(component.selectedOptionIds()).toEqual(['o1', 'o2']);
  });
});
