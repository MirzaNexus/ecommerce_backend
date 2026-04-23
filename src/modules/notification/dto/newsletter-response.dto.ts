// Consistent Response Format
export interface NewsletterResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
