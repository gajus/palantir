// @flow

export default (a: ?string, b: ?string) => {
  if (a || b) {
    if (!a) {
      return -1;
    }

    return b ? a.localeCompare(b) : 1;
  }

  return 0;
};
