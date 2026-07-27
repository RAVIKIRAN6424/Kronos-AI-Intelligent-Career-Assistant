import React, { useState, useEffect } from 'react';
import { Sliders, Clock, Calendar, Save, CheckCircle2, Shield, Play, Pause, Info } from 'lucide-react';
import { api } from '../utils/api';

export const AutomationSettingsView = ({ toast }) => {
  const [mode, setMode] = useState('Automatic'); // 'Automatic' | 'Manual' | 'Automatic OFF'
  const [dailyStartTime, setDailyStartTime] = useState('09:00');
  const [dailyStopTime, setDailyStopTime] = useState('18:00');
  const [repeatDays, setRepeatDays] = useState('Everyday'); // 'Everyday' | 'Weekdays' | 'Weekends'
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAutomationConfig();
  }, []);

  const fetchAutomationConfig = async () => {
    try {
      const config = await api.getAutomationConfig();
      if (config) {
        setMode(config.mode || 'Automatic');
        setDailyStartTime(config.daily_start_time || '09:00');
        setDailyStopTime(config.daily_stop_time || '18:00');
        setRepeatDays(config.repeat_days || 'Everyday');
      }
    } catch (err) {
      console.warn('Failed to fetch automation config:', err);
    }
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'Automatic') {
      api.updateBotState({ is_running: 1, current_job: 'Autonomous Scanning Portals...' }).catch(() => {});
    } else if (selectedMode === 'Automatic OFF') {
      api.updateBotState({ is_running: 0, current_job: 'Automation Engine OFF' }).catch(() => {});
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await api.updateAutomationConfig({
        mode,
        daily_start_time: dailyStartTime,
        daily_stop_time: dailyStopTime,
        repeat_days: repeatDays
      });

      if (mode === 'Automatic') {
        await api.updateBotState({ is_running: 1, current_job: 'Autonomous Portal Job Checking Active' });
      } else {
        await api.updateBotState({ is_running: 0, current_job: mode === 'Manual' ? 'Manual Trigger Mode' : 'Automation Engine OFF' });
      }

      toast(`Automation Config saved in "${mode}" mode!`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to save automation settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isScheduleDisabled = mode !== 'Automatic';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={24} color="var(--accent-cyan)" /> Automation Settings Studio
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Configure execution modes, daily start and stop time windows, and repeat frequency for autonomous job application queueing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Mode Selector */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--accent-cyan)" /> Automation Mode Selection
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'Automatic', title: 'Automatic Mode', desc: 'Kronos AI automatically checks portals, scans postings, and applies within daily start/stop hours.' },
              { id: 'Manual', title: 'Manual Mode', desc: 'Requires manual click of START button on Dashboard to scan and submit applications.' },
              { id: 'Automatic OFF', title: 'Automatic OFF Mode', desc: 'Completely pauses all background automated application triggers.' }
            ].map(m => {
              const isSelected = mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleModeSelect(m.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(2, 6, 15, 0.6)',
                    border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--accent-cyan)' : '#ffffff' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                      {m.desc}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={22} color="var(--accent-cyan)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Windows & Repeat Frequency */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', opacity: isScheduleDisabled ? 0.75 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--accent-purple)" /> Daily Schedule & Time Windows
            </h3>
            {isScheduleDisabled && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} /> Schedule applies in Automatic Mode
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Daily Start Time
              </label>
              <input
                type="time"
                className="cyber-input"
                value={dailyStartTime}
                onChange={e => setDailyStartTime(e.target.value)}
                disabled={isScheduleDisabled}
                style={{ opacity: isScheduleDisabled ? 0.6 : 1 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Daily Stop Time
              </label>
              <input
                type="time"
                className="cyber-input"
                value={dailyStopTime}
                onChange={e => setDailyStopTime(e.target.value)}
                disabled={isScheduleDisabled}
                style={{ opacity: isScheduleDisabled ? 0.6 : 1 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Repeat Schedule
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {['Everyday', 'Weekdays', 'Weekends'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRepeatDays(r)}
                  disabled={isScheduleDisabled}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: repeatDays === r ? 'var(--accent-purple)' : 'rgba(2, 6, 15, 0.6)',
                    color: repeatDays === r ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: isScheduleDisabled ? 'not-allowed' : 'pointer',
                    opacity: isScheduleDisabled ? 0.6 : 1
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn-cyber"
            style={{ width: '100%', padding: '14px', marginTop: 'auto', justifyContent: 'center' }}
            onClick={handleSaveConfig}
            disabled={saving}
          >
            <Save size={18} /> {saving ? 'Saving Config...' : `Save Automation Config (${mode})`}
          </button>
        </div>
      </div>
    </div>
  );
};
