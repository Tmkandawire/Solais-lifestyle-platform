export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`An account with email "${email}" already exists.`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`No account found with id "${id}".`);
    this.name = 'AccountNotFoundError';
  }
}
