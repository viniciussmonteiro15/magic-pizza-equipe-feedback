import { USE_API } from './api';
import * as local from './employeeService.local';
import * as remote from './employeeService.api';

export { ServiceError } from './errors';

const impl = USE_API ? remote : local;
export const registerEmployee = (...args) => impl.registerEmployee(...args);
export const loginWithRg = (...args) => impl.loginWithRg(...args);
export const getSessionEmployee = (...args) => impl.getSessionEmployee(...args);
export const logout = (...args) => impl.logout(...args);
export const saveAvailability = (...args) => impl.saveAvailability(...args);
export const listEmployees = (...args) => impl.listEmployees(...args);
