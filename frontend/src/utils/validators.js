import { AGE_LIMITS, MESSAGE_LIMIT, MESSAGE_MIN } from './constants';
import { isValidRg } from './rg';
import { toMinutes } from './time';

export function validateEmployee(form) {
  const errors = {};
  const nome = form.nome.trim().replace(/\s+/g, ' ');

  if (!nome) errors.nome = 'Informe seu nome completo.';
  else if (nome.split(' ').length < 2) errors.nome = 'Digite nome e sobrenome.';

  if (!form.rg.trim()) errors.rg = 'Informe seu RG.';
  else if (!isValidRg(form.rg)) errors.rg = 'RG inválido. Digite de 7 a 12 caracteres; só o último pode ser X.';

  const idade = Number(form.idade);
  if (!String(form.idade).trim()) errors.idade = 'Informe sua idade.';
  else if (!Number.isInteger(idade) || idade < AGE_LIMITS.min || idade > AGE_LIMITS.max) {
    errors.idade = `A idade deve estar entre ${AGE_LIMITS.min} e ${AGE_LIMITS.max} anos.`;
  }

  if (!form.cnh) errors.cnh = 'Informe se você possui carteira de motorista.';
  if (!form.cargo) errors.cargo = 'Escolha sua função.';
  return errors;
}

export function validateAvailabilityDay(day) {
  if (!day.ativo) return null;
  if (!day.inicio || !day.fim) return 'Informe o horário inicial e o final.';
  if (toMinutes(day.fim) <= toMinutes(day.inicio)) return 'O horário final precisa ser depois do inicial.';
  return null;
}

export function validateFeedback(form) {
  const errors = {};
  if (!form.tipo) errors.tipo = 'Escolha o tipo da mensagem.';
  if (!form.nota) errors.nota = 'Dê uma nota geral de 1 a 5 estrelas.';
  const msg = form.mensagem.trim();
  if (!msg) errors.mensagem = 'Escreva sua mensagem.';
  else if (msg.length < MESSAGE_MIN) errors.mensagem = `Escreva pelo menos ${MESSAGE_MIN} caracteres.`;
  else if (msg.length > MESSAGE_LIMIT) errors.mensagem = `Use no máximo ${MESSAGE_LIMIT} caracteres.`;
  return errors;
}
