import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizSession } from '../models/quiz.model';
import { QuizApiService } from './quiz-api.service';
import { QuizSessionStore } from './quiz-session.store';

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
    {
      questionId: 'q2',
      statement: 'Question 2',
      type: 'SINGLE_CHOICE',
      options: [{ optionId: 'o3', label: 'Option 3' }],
    },
  ],
};

describe('QuizSessionStore', () => {
  let store: QuizSessionStore;
  let api: { submitAnswer: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { submitAnswer: vi.fn() };
    TestBed.configureTestingModule({
      providers: [QuizSessionStore, { provide: QuizApiService, useValue: api }],
    });
    store = TestBed.inject(QuizSessionStore);
  });

  it('starts a session at the first question', () => {
    store.start(session);

    expect(store.session()).toEqual(session);
    expect(store.currentIndex()).toBe(0);
    expect(store.currentQuestion()?.questionId).toBe('q1');
    expect(store.isLastQuestion()).toBe(false);
    expect(store.progressPercent()).toBe(50);
  });

  it('submits an answer and records it as answered', () => {
    store.start(session);
    api.submitAnswer.mockReturnValue(
      of({ correct: true, correctOptionIds: ['o1'], explanation: 'Because.' })
    );

    store.submitAnswer(['o1']).subscribe();

    expect(api.submitAnswer).toHaveBeenCalledWith('session-1', 'q1', { selectedOptionIds: ['o1'] });
    expect(store.lastResult()?.correct).toBe(true);
    expect(store.answeredQuestionIds().has('q1')).toBe(true);
  });

  it('advances to the next question and detects the last one', () => {
    store.start(session);

    store.goToNextQuestion();

    expect(store.currentIndex()).toBe(1);
    expect(store.currentQuestion()?.questionId).toBe('q2');
    expect(store.isLastQuestion()).toBe(true);
    expect(store.lastResult()).toBeNull();
  });

  it('resets all state', () => {
    store.start(session);
    store.goToNextQuestion();

    store.reset();

    expect(store.session()).toBeNull();
    expect(store.currentIndex()).toBe(0);
    expect(store.answeredQuestionIds().size).toBe(0);
  });
});
