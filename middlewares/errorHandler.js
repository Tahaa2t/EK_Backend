const isDev = process.env.NODE_ENV !== 'production';

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error(isDev ? err.stack : err.message);
  }

  const body = { message: err.expose && err.message ? err.message : statusMessage(status) };
  if (isDev && status >= 500) {
    body.error = err.message;
  }

  res.status(status).json(body);
}

function statusMessage(status) {
  if (status === 400) return 'Bad Request';
  if (status === 401) return 'Unauthorized';
  if (status === 403) return 'Forbidden';
  if (status === 404) return 'Not Found';
  if (status === 409) return 'Conflict';
  if (status === 429) return 'Too Many Requests';
  return 'Server Error';
}

export default errorHandler;
