export class SessionNotFoundError extends Error {
  constructor(id: string) {
    super(`No session found with id "${id}".`);
    this.name = 'SessionNotFoundError';
  }
}
