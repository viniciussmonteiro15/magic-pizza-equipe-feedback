import { useMemo, useState } from 'react';
import Button from '../ui/Button';
import { DAYS, TIMELINE, TIME_PRESETS } from '../../utils/constants';
import { formatDuration, timelinePosition, windowMinutes } from '../../utils/time';
import { validateAvailabilityDay } from '../../utils/validators';
import { saveAvailability } from '../../services/employeeService';

const hours = Array.from(
  { length: TIMELINE.endHour - TIMELINE.startHour + 1 },
  (_, i) => TIMELINE.startHour + i
).filter((h) => h % TIMELINE.tickEvery === 0);

/**
 * Painel privado de disponibilidade. Cada dia tem um interruptor (ativo ou
 * não) e um intervalo de horário; uma linha do tempo resume a semana toda.
 */
export default function AvailabilityPanel({ employee, onSaved }) {
  const [days, setDays] = useState(employee.disponibilidade);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState('');

  const totalMinutes = useMemo(() => Object.values(days).reduce((sum, d) => sum + windowMinutes(d), 0), [days]);
  const activeCount = useMemo(() => Object.values(days).filter((d) => d.ativo).length, [days]);

  function updateDay(id, patch) {
    setDays((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setErrors((prev) => (prev[id] ? { ...prev, [id]: undefined } : prev));
    setSavedAt(null);
  }

  function applyPreset(id, preset) {
    updateDay(id, { ativo: true, inicio: preset.inicio, fim: preset.fim });
  }

  async function handleSave() {
    const nextErrors = {};
    DAYS.forEach((d) => {
      const msg = validateAvailabilityDay(days[d.id]);
      if (msg) nextErrors[d.id] = msg;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaveError('');
    try {
      const updated = await saveAvailability(employee.id, days);
      onSaved(updated);
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(err.message || 'Não foi possível salvar agora. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="availability">
      <div className="availability__summary">
        <div>
          <p className="availability__summary-value">{activeCount}</p>
          <p className="availability__summary-label">{activeCount === 1 ? 'dia disponível' : 'dias disponíveis'}</p>
        </div>
        <div>
          <p className="availability__summary-value">{formatDuration(totalMinutes)}</p>
          <p className="availability__summary-label">na semana</p>
        </div>
      </div>

      <ol className="availability__timeline" aria-hidden="true">
        {DAYS.map((day) => {
          const { left, width } = timelinePosition(days[day.id], TIMELINE);
          return (
            <li key={day.id} className="availability__timeline-row">
              <span className="availability__timeline-label">{day.label.slice(0, 3)}</span>
              <span className="availability__timeline-track">
                {days[day.id].ativo && width > 0 && (
                  <span className="availability__timeline-bar" style={{ left: `${left}%`, width: `${width}%` }} />
                )}
              </span>
            </li>
          );
        })}
        <li className="availability__timeline-scale">
          <span className="availability__timeline-label" />
          <span className="availability__timeline-track">
            {hours.map((h) => (
              <span
                key={h}
                className="availability__timeline-tick"
                style={{ left: `${((h - TIMELINE.startHour) / (TIMELINE.endHour - TIMELINE.startHour)) * 100}%` }}
              >
                {h}h
              </span>
            ))}
          </span>
        </li>
      </ol>

      <ul className="availability__days">
        {DAYS.map((day) => {
          const state = days[day.id];
          return (
            <li key={day.id} className={`day-row ${state.ativo ? 'is-active' : ''}`}>
              <div className="day-row__head">
                <label className="day-row__switch">
                  <input
                    type="checkbox"
                    checked={state.ativo}
                    onChange={(e) => updateDay(day.id, { ativo: e.target.checked })}
                  />
                  <span className="day-row__track" aria-hidden="true">
                    <span className="day-row__thumb" />
                  </span>
                  <span className="day-row__day-label">{day.label}</span>
                </label>

                {state.ativo && (
                  <div className="day-row__presets">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`preset-chip ${state.inicio === preset.inicio && state.fim === preset.fim ? 'is-selected' : ''}`}
                        onClick={() => applyPreset(day.id, preset)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {state.ativo && (
                <div className="day-row__times">
                  <label className="day-row__time-field">
                    <span>Das</span>
                    <input
                      type="time"
                      className="input"
                      value={state.inicio}
                      onChange={(e) => updateDay(day.id, { inicio: e.target.value })}
                      aria-label={`Horário inicial de ${day.label}`}
                    />
                  </label>
                  <label className="day-row__time-field">
                    <span>às</span>
                    <input
                      type="time"
                      className="input"
                      value={state.fim}
                      onChange={(e) => updateDay(day.id, { fim: e.target.value })}
                      aria-label={`Horário final de ${day.label}`}
                    />
                  </label>
                </div>
              )}

              {errors[day.id] && (
                <p className="field__error" role="alert">
                  {errors[day.id]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="availability__footer">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar disponibilidade'}
        </Button>
        <span className="availability__status" role="status" aria-live="polite">
          {saveError ? '' : savedAt ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </span>
        {saveError && (
          <span className="field__error" role="alert">
            {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
