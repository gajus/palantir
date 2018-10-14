// @flow

import ExtendableError from 'es6-error';

export class UserError extends ExtendableError {
  code: string;

  constructor (message: string, code: string = 'USER_ERROR') {
    super(message);

    this.code = code;
  }
}

export class NotFoundError extends UserError {
  constructor () {
    super('Resource not found.', 'RESOURCE_NOT_FOUND');
  }
}
