// ----------ERRO HTTP CUSTOMIZADO----------
class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new HttpError(400, message, details);
  }

  static notFound(message = 'Recurso não encontrado') {
    return new HttpError(404, message);
  }

  static internal(message = 'Erro interno do servidor') {
    return new HttpError(500, message);
  }
}

module.exports = HttpError;
