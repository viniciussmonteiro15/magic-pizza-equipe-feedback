import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import './styles/tokens.css';
import './styles/base.css';

import './components/layout/Header.css';
import './components/layout/Footer.css';
import './components/layout/PageHeader.css';

import './components/ui/Button.css';
import './components/ui/Field.css';
import './components/ui/ChoiceGroup.css';
import './components/ui/Modal.css';
import './components/ui/Toast.css';
import './components/ui/StarRating.css';
import './components/ui/Tag.css';
import './components/ui/EmptyState.css';

import './components/team/RegisterForm.css';
import './components/team/AuthModal.css';
import './components/team/AvailabilityPanel.css';
import './components/team/TeamTab.css';

import './components/feedback/FeedbackForm.css';
import './components/feedback/FeedbackStats.css';
import './components/feedback/FeedbackCard.css';
import './components/feedback/FeedbackList.css';
import './components/feedback/FeedbackTab.css';

import './components/manager/AvailabilityGrid.css';
import './components/manager/ManagerTab.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
