import { useState } from 'react';
import './ModelSettings.css';

const MODELS = [
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'TNG: DeepSeek R1T2 Chimera' },
  { id: 'kwaipilot/kat-coder-pro:free', name: 'Kwaipilot: KAT-Coder-Pro V1' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'NVIDIA: Nemotron Nano 12B 2 VL' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen: Qwen3 Coder 480B A35B' },
  { id: 'google/gemma-3-27b-it:free', name: 'Google: Gemma 3 27B' },
//   { id: 'google/gemini-pro', name: 'Gemini Pro' },
//   { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' }
];


const SYSTEM_PROMPT_PRESETS = [
  {
    name: 'Default Assistant',
    prompt: 'You are a helpful assistant.'
  },
  {
    name: 'Code Expert',
    prompt: 'You are an expert programmer. Provide clear, concise code examples and explanations.'
  },
  {
    name: 'Creative Writer',
    prompt: 'You are a creative writer. Be imaginative and expressive in your responses.'
  },
  {
    name: 'Technical Analyst',
    prompt: 'You are a technical analyst. Provide detailed, analytical responses with data and reasoning.'
  },
  {
    name: 'Friendly Tutor',
    prompt: 'You are a patient tutor. Explain concepts clearly and encourage learning.'
  }
];

const ModelSettings = ({ settings, onSave, saving }) => {
  const [temperature, setTemperature] = useState(settings?.temperature || 0.7);
  const [model, setModel] = useState(settings?.model || 'gpt-3.5-turbo');
  const [systemPrompt, setSystemPrompt] = useState(
    settings?.systemPrompt || 'You are a helpful assistant.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ temperature, model, systemPrompt });
  };

  const applyPreset = (preset) => {
    setSystemPrompt(preset.prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="model-settings">
      <div className="settings-section">
        <h3>Model Selection</h3>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="settings-select"
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-section">
        <h3>Temperature: {temperature.toFixed(2)}</h3>
        <p className="settings-description">
          Controls randomness. Lower values make responses more focused and deterministic.
        </p>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="settings-slider"
        />
        <div className="slider-labels">
          <span>Precise (0)</span>
          <span>Balanced (1)</span>
          <span>Creative (2)</span>
        </div>
      </div>

      <div className="settings-section">
        <h3>System Prompt</h3>
        <p className="settings-description">
          Define how the AI should behave and respond.
        </p>
        
        <div className="preset-buttons">
          {SYSTEM_PROMPT_PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="preset-button"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="settings-textarea"
          rows={4}
          placeholder="Enter system prompt..."
        />
      </div>

      <button type="submit" disabled={saving} className="save-button">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
};

export default ModelSettings;