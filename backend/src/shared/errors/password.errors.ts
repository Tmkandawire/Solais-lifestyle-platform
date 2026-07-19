export class PasswordTooLongError extends Error {
  constructor(maxBytes: number) {
    super(`Password exceeds the maximum supported length of ${maxBytes} bytes.`);
    this.name = 'PasswordTooLongError';
  }
}
