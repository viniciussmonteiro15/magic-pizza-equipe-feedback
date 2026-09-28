export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3001,
    corsOrigins: (env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    dbFile: env.DB_FILE || './data/magic-pizza.db',
    rgPepper: env.RG_PEPPER || '',
    tokenSecret: env.TOKEN_SECRET || '',
    managerPassword: env.MANAGER_PASSWORD || '',
    loginMaxAttempts: Number(env.LOGIN_MAX_ATTEMPTS) || 10,
    loginWindowMs: 15 * 60 * 1000,
    // Cadastros e feedbacks são públicos: limite de envios por IP na mesma janela.
    writeMaxRequests: Number(env.WRITE_MAX_REQUESTS) || 30,
    trustProxy: env.TRUST_PROXY === '1',
    employeeTokenTtl: 12 * 60 * 60, // segundos
    managerTokenTtl: 8 * 60 * 60,
  };
}

/** Falha cedo, com mensagem clara, se faltar algum segredo. */
export function assertConfig(config) {
  const problems = [];
  if (config.rgPepper.length < 16) problems.push('RG_PEPPER precisa ter pelo menos 16 caracteres');
  if (config.tokenSecret.length < 16) problems.push('TOKEN_SECRET precisa ter pelo menos 16 caracteres');
  if (config.managerPassword && config.managerPassword.length < 6) {
    problems.push('MANAGER_PASSWORD, se definido, precisa ter pelo menos 6 caracteres');
  }
  if (problems.length) {
    throw new Error(`Configuração inválida (veja .env.example):\n - ${problems.join('\n - ')}`);
  }
}
