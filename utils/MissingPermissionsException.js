export class MissingPermissionsException {
  constructor(permissions) {
    this.permissions = permissions;
    this.message = 'Missing permissions:';
  }

  toString() {
    return `${this.message} ${this.permissions.join(', ')}`;
  }
}
