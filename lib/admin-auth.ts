const defaultAdminUsername = 'truchita-admin';

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME || defaultAdminUsername;
}

export function adminAuthResult(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return { ok: false as const, status: 503, message: 'El panel aún no tiene contraseña configurada.' };
  }

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) {
    return { ok: false as const, status: 401, message: 'Inicia sesión para continuar.' };
  }

  try {
    const [username, suppliedPassword] = atob(authorization.slice(6)).split(':');
    if (username === getAdminUsername() && suppliedPassword === password) {
      return { ok: true as const };
    }
  } catch {
    // A malformed authorization header is treated as an invalid login.
  }

  return { ok: false as const, status: 401, message: 'Usuario o contraseña incorrectos.' };
}
