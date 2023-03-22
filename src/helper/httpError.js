class HttpError extends Error {
    constructor(code = 500, message = 'Internal server error', url = '') {
      super(message);
      this.code = code;
    }
  }
  
  module.exports = HttpError;