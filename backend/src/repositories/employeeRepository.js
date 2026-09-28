import { transaction } from '../db.js';
import { DAYS } from '../utils/validation.js';

export function createEmployeeRepository(db) {
  const insertEmployee = db.prepare(
    `INSERT INTO employees (id, nome, rg_lookup, idade, cnh, cargo, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const upsertDay = db.prepare(
    `INSERT INTO availability (employee_id, dia, ativo, inicio, fim) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (employee_id, dia) DO UPDATE SET ativo = excluded.ativo, inicio = excluded.inicio, fim = excluded.fim`
  );
  const selectByLookup = db.prepare('SELECT * FROM employees WHERE rg_lookup = ?');
  const selectById = db.prepare('SELECT * FROM employees WHERE id = ?');
  const selectAll = db.prepare('SELECT * FROM employees ORDER BY nome COLLATE NOCASE');
  const selectDays = db.prepare('SELECT dia, ativo, inicio, fim FROM availability WHERE employee_id = ?');
  const selectAllDays = db.prepare('SELECT employee_id, dia, ativo, inicio, fim FROM availability');

  const toWeek = (rows) => {
    const week = Object.fromEntries(DAYS.map((d) => [d, { ativo: false, inicio: '18:00', fim: '23:00' }]));
    for (const r of rows) week[r.dia] = { ativo: r.ativo === 1, inicio: r.inicio, fim: r.fim };
    return week;
  };

  const toEmployee = (row, week) => ({
    id: row.id,
    nome: row.nome,
    idade: row.idade,
    cnh: row.cnh,
    cargo: row.cargo,
    criadoEm: row.criado_em,
    disponibilidade: week,
  });

  const writeWeek = (employeeId, week) => {
    for (const dia of DAYS) {
      const d = week[dia];
      upsertDay.run(employeeId, dia, d.ativo ? 1 : 0, d.inicio, d.fim);
    }
  };

  return {
    /** Cria o funcionário já com os 7 dias de disponibilidade (todos inativos). */
    create({ id, nome, lookup, idade, cnh, cargo, week }) {
      transaction(db, () => {
        insertEmployee.run(id, nome, lookup, idade, cnh, cargo, new Date().toISOString());
        writeWeek(id, week);
      });
      return this.findById(id);
    },
    findByLookup(lookup) {
      const row = selectByLookup.get(lookup);
      return row ? toEmployee(row, toWeek(selectDays.all(row.id))) : null;
    },
    findById(id) {
      const row = selectById.get(id);
      return row ? toEmployee(row, toWeek(selectDays.all(id))) : null;
    },
    /** Toda a equipe, com duas consultas (sem uma por funcionário). */
    list() {
      const byEmployee = new Map();
      for (const r of selectAllDays.all()) {
        if (!byEmployee.has(r.employee_id)) byEmployee.set(r.employee_id, []);
        byEmployee.get(r.employee_id).push(r);
      }
      return selectAll.all().map((row) => toEmployee(row, toWeek(byEmployee.get(row.id) ?? [])));
    },
    saveAvailability(id, week) {
      transaction(db, () => writeWeek(id, week));
      return this.findById(id);
    },
  };
}
