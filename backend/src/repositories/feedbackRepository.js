export function createFeedbackRepository(db) {
  const insert = db.prepare(
    `INSERT INTO feedback (id, nome, tipo, nota, categorias, mensagem, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const selectRecent = db.prepare('SELECT * FROM feedback ORDER BY criado_em DESC LIMIT ?');
  const selectById = db.prepare('SELECT * FROM feedback WHERE id = ?');

  const toFeedback = (r) => ({
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    nota: r.nota,
    categorias: JSON.parse(r.categorias),
    mensagem: r.mensagem,
    criadoEm: r.criado_em,
  });

  return {
    create({ id, nome, tipo, nota, categorias, mensagem }) {
      insert.run(id, nome, tipo, nota, JSON.stringify(categorias), mensagem, new Date().toISOString());
      return toFeedback(selectById.get(id));
    },
    listRecent(limit = 200) {
      return selectRecent.all(limit).map(toFeedback);
    },
  };
}
