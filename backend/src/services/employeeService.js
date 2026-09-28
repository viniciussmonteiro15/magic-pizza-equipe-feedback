import crypto from 'node:crypto';
import { HttpError } from '../utils/errors.js';
import { rgLookup, signToken } from '../utils/security.js';
import { DAYS, isValidRg, normalizeRg, parseAvailability, parseEmployee } from '../utils/validation.js';

const emptyWeek = () => Object.fromEntries(DAYS.map((d) => [d, { ativo: false, inicio: '18:00', fim: '23:00' }]));
const isUniqueViolation = (err) => /UNIQUE constraint failed/i.test(err?.message ?? '');

export function createEmployeeService({ repo, config }) {
  const lookupFor = (rg) => rgLookup(normalizeRg(rg), config.rgPepper);

  return {
    register(body) {
      const data = parseEmployee(body);
      const lookup = lookupFor(data.rg);
      if (repo.findByLookup(lookup)) throw new HttpError(409, 'RG_DUPLICATE', 'Este RG já está cadastrado.');
      try {
        return repo.create({ id: crypto.randomUUID(), ...data, lookup, week: emptyWeek() });
      } catch (err) {
        // Dois cadastros simultâneos com o mesmo RG: o banco barra o segundo.
        if (isUniqueViolation(err)) throw new HttpError(409, 'RG_DUPLICATE', 'Este RG já está cadastrado.');
        throw err;
      }
    },

    login(body) {
      if (!isValidRg(body?.rg)) throw new HttpError(404, 'NOT_FOUND', 'RG não encontrado.');
      const employee = repo.findByLookup(lookupFor(body.rg));
      if (!employee) throw new HttpError(404, 'NOT_FOUND', 'RG não encontrado.');
      const token = signToken({ sub: employee.id, role: 'employee' }, config.tokenSecret, config.employeeTokenTtl);
      return { token, employee };
    },

    getById(id) {
      const employee = repo.findById(id);
      if (!employee) throw new HttpError(401, 'UNAUTHORIZED', 'Sessão inválida. Entre novamente.');
      return employee;
    },

    saveAvailability(id, body) {
      const week = parseAvailability(body);
      this.getById(id);
      return repo.saveAvailability(id, week);
    },

    listTeam() {
      return repo.list();
    },
  };
}
