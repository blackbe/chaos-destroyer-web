# HugBack Feature #64: Filter by Mood and Reason for Support

I'll build a complete filter system for mood and reason across the Matches and HugBoard features.

## Implementation

[FILE: src/components/MoodReasonFilter.js]
```jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './MoodReasonFilter.css';

const MOODS = [
  { id: 'anxious', label: 'Anxious', icon: '😰' },
  { id: 'sad', label: 'Sad', icon: '😢' },
  { id: 'stressed', label: 'Stressed', icon: '😓' },
  { id: 'lonely', label: 'Lonely', icon: '😔' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: '😵' },
  { id: 'angry', label: 'Angry', icon: '😠' },
  { id: 'confused', label: 'Confused', icon: '😕' },
  { id: 'unmotivated', label: 'Unmotivated', icon: '😐' },
];

const REASONS = [
  { id: 'relationships', label: 'Relationships' },
  { id: 'work', label: 'Work & Career' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'family', label: 'Family Issues' },
  { id: 'finances', label: 'Finances' },
  { id: 'identity', label: 'Identity & Self' },
  { id: 'grief', label: 'Loss & Grief' },
  { id: 'other', label: 'Other' },
];

const MoodReasonFilter = ({
  onFilterChange,
  selectedMoods = [],
  selectedReasons = [],
  isCompact = false,
  showClearButton = true,
}) => {
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  const handleMoodToggle = (moodId) => {
    const updated = selectedMoods.includes(moodId)
      ? selectedMoods.filter((m) => m !== moodId)
      : [...selectedMoods, moodId];
    onFilterChange({ moods: updated, reasons: selectedReasons });
  };

  const handleReasonToggle = (reasonId) => {
    const updated = selectedReasons.includes(reasonId)
      ? selectedReasons.filter((r) => r !== reasonId)
      : [...selectedReasons, reasonId];
    onFilterChange({ moods: selectedMoods, reasons: updated });
  };

  const handleClear = () => {
    onFilterChange({ moods: [], reasons: [] });
    setShowMoodDropdown(false);
    setShowReasonDropdown(false);
  };

  const hasFilters = selectedMoods.length > 0 || selectedReasons.length > 0;

  if (isCompact) {
    return (
      <div className="mood-reason-filter compact">
        <div className="filter-chip-container">
          {selectedMoods.map((moodId) => {
            const mood = MOODS.find((m) => m.id === moodId);
            return (
              <span key={moodId} className="filter-chip mood-chip">
                <span className="chip-icon">{mood?.icon}</span>
                <span className="chip-label">{mood?.label}</span>
                <button
                  className="chip-remove"
                  onClick={() => handleMoodToggle(moodId)}
                  aria-label={`Remove ${mood?.label} filter`}
                >
                  ×
                </button>
              </span>
            );
          })}
          {selectedReasons.map((reasonId) => {
            const reason = REASONS.find((r) => r.id === reasonId);
            return (
              <span key={reasonId} className="filter-chip reason-chip">
                <span className="chip-label">{reason?.label}</span>
                <button
                  className="chip-remove"
                  onClick={() => handleReasonToggle(reasonId)}
                  aria-label={`Remove ${reason?.label} filter`}
                >
                  ×
                </button>
              </span>
            );
          })}
          {hasFilters && showClearButton && (
            <button className="filter-clear-btn" onClick={handleClear}>
              Clear All
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mood-reason-filter">
      <div className="filter-section">
        <div className="filter-header">
          <h3 className="filter-title">Filter by Mood</h3>
          {selectedMoods.length > 0 && (
            <span className="filter-count">{selectedMoods.length}</span>
          )}
        </div>
        <button
          className={`filter-dropdown-toggle ${showMoodDropdown ? 'active' : ''}`}
          onClick={() => setShowMoodDropdown(!showMoodDropdown)}
          aria-expanded={showMoodDropdown}
          aria-controls="mood-filter-options"
        >
          {selectedMoods.length > 0
            ? `${selectedMoods.length} Selected`
            : 'Select Moods'}
          <span className="dropdown-arrow">▼</span>
        </button>

        {showMoodDropdown && (
          <div className="filter-options" id="mood-filter-options" role="group">
            {MOODS.map((mood) => (
              <label key={mood.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedMoods.includes(mood.id)}
                  onChange={() => handleMoodToggle(mood.id)}
                  aria-label={`Filter by ${mood.label}`}
                />
                <span className="option-icon">{mood.icon}</span>
                <span className="option-label">{mood.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <h3 className="filter-title">Filter by Reason</h3>
          {selectedReasons.length > 0 && (
            <span className="filter-count">{selectedReasons.length}</span>
          )}
        </div>
        <button
          className={`filter-dropdown-toggle ${showReasonDropdown ? 'active' : ''}`}
          onClick={() => setShowReasonDropdown(!showReasonDropdown)}
          aria-expanded={showReasonDropdown}
          aria-controls="reason-filter-options"
        >
          {selectedReasons.length > 0
            ? `${selectedReasons.length} Selected`
            : 'Select Reasons'}
          <span className="dropdown-arrow">▼</span>
        </button>

        {showReasonDropdown && (
          <div className="filter-options" id="reason-filter-options" role="group">
            {REASONS.map((reason) => (
              <label key={reason.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason.id)}
                  onChange={() => handleReasonToggle(reason.id)}
                  aria-label={`Filter by ${reason.label}`}
                />
                <span className="option-label">{reason.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {hasFilters && showClearButton && (
        <button className="filter-clear-btn full-width" onClick={handleClear}>
          Clear All Filters
        </button>
      )}
    </div>
  );
};

MoodReasonFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  selectedMoods: PropTypes.arrayOf(PropTypes.string),
  selectedReasons: PropTypes.arrayOf(PropTypes.string),
  isCompact: PropTypes.bool,
  showClearButton: PropTypes.bool,
};

export default MoodReasonFilter;
export { MOODS, REASONS };
```

[FILE: src/components/MoodReasonFilter.css]
```css
.mood-reason-filter {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #fff3e6;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.mood-reason-filter.compact {
  padding: 1rem;
  gap: 1rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 0.5rem;
  background-color: #f59e0b;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-dropdown-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-dropdown-toggle:hover {
  border-color: #f59e0b;
  background-color: #fef3e2;
}

.filter-dropdown-toggle.active {
  border-color: #f59e0b;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.dropdown-arrow {
  display: inline-flex;
  margin-left: 0.5rem;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.filter-dropdown-toggle.active .dropdown-arrow {
  transform: rotate(180deg);
}

.filter-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef9f3;
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: 8px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-option:hover {
  background-color: #fff3e6;
}

.filter-option input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f59e0b;
}

.filter-option input[type='checkbox']:focus {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.option-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.option-label {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.filter-clear-btn {
  padding: 0.75rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-clear-btn:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.filter-clear-btn.full-width {
  width: 100%;
}

/* Compact Filter Styles */
.filter-chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

.filter-chip.mood-chip {
  border-color: rgba(245, 158, 11, 0.3);
  background-color: rgba(245, 158, 11, 0.05);
}

.filter-chip.reason-chip {
  border-color: rgba(59, 130, 246, 0.3);
  background-color: rgba(59, 130, 246, 0.05);
}

.chip-icon {
  font-size: 1rem;
}

.chip-label {
  white-space: nowrap;
}

.chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 0.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
}

.chip-remove:hover {
  color: #374151;
}

.filter-clear-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Responsive Design */
@media (min-width: 768px) {
  .mood-reason-filter {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .filter-options {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .filter-options {
    grid-template-columns: 1fr;
  }
}

/* Accessibility */
.filter-option input[type='checkbox']:checked + .option-icon,
.filter-option input[type
