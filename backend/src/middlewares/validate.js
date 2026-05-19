// validate.js Valida o body da requisição com um schema Zod antes de passar ao controller

// ----------MIDDLEWARE DE VALIDACAO COM ZOD----------
const HttpError = require('../utils/http-error');

// Valida partes do request (body, query, params) contra schemas Zod
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      if (err.issues) {
        return next(HttpError.badRequest('Dados invalidos', err.issues));
      }
      next(err);
    }
  };
}

module.exports = validate;
