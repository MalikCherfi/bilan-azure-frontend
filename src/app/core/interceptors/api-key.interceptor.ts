import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Attaches the shared `X-Api-Key` header to requests going to the backend API.
 *
 * The backend's ApiKeyFilter only enforces this when its own key is configured
 * (production). Locally, `environment.apiKey` is empty, so this is a no-op and
 * matches the backend's own local behavior.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.apiKey || !req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'X-Api-Key': environment.apiKey } }));
};
