export class HttpError extends Error {
  /**
   * @param {number} statusCode - HTTP status code to return
   * @param {string} code - machine readable error code (e.g., REPO_NOT_FOUND)
   * @param {string} message - human readable message
   * @param {any} [details] - optional extra details for debugging
   */
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
