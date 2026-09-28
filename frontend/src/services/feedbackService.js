import { USE_API } from './api';
import * as local from './feedbackService.local';
import * as remote from './feedbackService.api';

const impl = USE_API ? remote : local;
export const listFeedback = (...args) => impl.listFeedback(...args);
export const addFeedback = (...args) => impl.addFeedback(...args);
