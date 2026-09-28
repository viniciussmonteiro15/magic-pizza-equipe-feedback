import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sem isto, cada `render()` se acumula no DOM entre os testes de um mesmo arquivo.
afterEach(() => {
  cleanup();
});

// jsdom ainda não implementa <dialog>.showModal()/close().
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
