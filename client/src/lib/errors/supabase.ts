import { AuthError, PostgrestError } from '@supabase/supabase-js';
import { authTranslations, AuthTranslationKey } from '@/lib/i18n/tr/auth';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

type ErrorContext = 'login' | 'register' | 'profile';

export function translateSupabaseError(
  error: unknown,
  context: ErrorContext = 'login'
): AppError {
  // Log original error for debugging
  console.error(`Supabase error in ${context}:`, error);

  let code: AuthTranslationKey;
  let message: string;

  // Handle AuthError from Supabase Auth
  if (error && typeof error === 'object' && 'status' in error) {
    const authError = error as AuthError;
    const errorMessage = authError.message?.toLowerCase() || '';
    const status = authError.status;

    // Map by error message patterns
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password')) {
      code = 'auth.invalid_credentials';
    } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
      code = 'auth.invalid_email';
    } else if (errorMessage.includes('email not confirmed')) {
      code = 'auth.email_not_confirmed';
    } else if (errorMessage.includes('user not found') ||
               errorMessage.includes('user does not exist')) {
      code = 'auth.user_not_found';
    } else if (errorMessage.includes('already registered') ||
               errorMessage.includes('already exists') ||
               errorMessage.includes('user already registered')) {
      code = 'auth.email_already_exists';
    } else if (errorMessage.includes('password') && 
               (errorMessage.includes('weak') || errorMessage.includes('short'))) {
      code = 'auth.weak_password';
    } else if (status === 429) {
      code = 'auth.too_many_requests';
    } else {
      // Generic error based on context
      code = `auth.unknown.${context}` as AuthTranslationKey;
    }
  }
  // Handle PostgrestError
  else if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    
    if (pgError.code === 'PGRST116') {
      code = 'auth.profile_not_found';
    } else {
      code = `auth.unknown.${context}` as AuthTranslationKey;
    }
  }
  // Handle network errors
  else if (error instanceof TypeError && error.message.includes('fetch')) {
    code = 'auth.network_error';
  }
  // Handle generic errors
  else {
    code = `auth.unknown.${context}` as AuthTranslationKey;
  }

  // Get translated message
  message = authTranslations[code] || authTranslations['auth.unknown.login'];

  return new AppError(message, code, error);
}
