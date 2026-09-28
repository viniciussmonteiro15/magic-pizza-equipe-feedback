/**
 * Camada mínima de persistência local.
 * Se localStorage/sessionStorage estiverem indisponíveis (modo privado,
 * iframes restritos), cai para um Map em memória para a sessão da aba atual.
 *
 * Importante: a escolha entre backend real e memória é feita uma única vez.
 * Nunca gravamos nos dois ao mesmo tempo — isso criaria um cache que não
 * seria invalidado se algo limpar o storage real por fora deste módulo
 * (como acontece em testes com `localStorage.clear()`), fazendo a aplicação
 * ler dados "fantasma" que já deveriam ter sumido.
 */
function detectBackend(kind) {
  try {
    const storage = window[kind];
    const probeKey = '__magicpizza_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

function createStore(kind) {
  const backend = detectBackend(kind);
  const memory = backend ? null : new Map();

  return {
    read(key, defaultValue) {
      if (backend) {
        const raw = backend.getItem(key);
        if (raw == null) return defaultValue;
        try {
          return JSON.parse(raw);
        } catch {
          return defaultValue;
        }
      }
      return memory.has(key) ? memory.get(key) : defaultValue;
    },
    write(key, value) {
      if (backend) {
        backend.setItem(key, JSON.stringify(value));
      } else {
        memory.set(key, value);
      }
    },
    remove(key) {
      if (backend) {
        backend.removeItem(key);
      } else {
        memory.delete(key);
      }
    },
  };
}

export const persistent = createStore('localStorage');
export const sessionStore = createStore('sessionStorage');
