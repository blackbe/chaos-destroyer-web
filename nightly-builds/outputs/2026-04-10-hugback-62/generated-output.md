# HugBack Feature #62: Interest and Personality Questionnaire

I'll build a comprehensive interest and personality questionnaire feature that helps users establish better matches and understand themselves better.

## File Structure & Implementation

[FILE: src/components/Questionnaire/Questionnaire.js]
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../supabaseClient';
import './Questionnaire.css';
import QuestionnaireProgress from './QuestionnaireProgress';
import QuestionnaireQuestion from './QuestionnaireQuestion';
import QuestionnaireSummary from './QuestionnaireSummary';

const Questionnaire = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const QUESTIONS = [
    {
      id: 'interests',
      type: 'multiselect',
      category: 'Interests',
      question: 'What are your main interests? (Select all that apply)',
      options: [
        { value: 'sports', label: '🏃 Sports & Fitness' },
        { value: 'arts', label: '🎨 Arts & Creative' },
        { value: 'music', label: '🎵 Music' },
        { value: 'reading', label: '📚 Reading' },
        { value: 'gaming', label: '🎮 Gaming' },
        { value: 'tech', label: '💻 Technology' },
        { value: 'cooking', label: '🍳 Cooking' },
        { value: 'travel', label: '✈️ Travel' },
        { value: 'nature', label: '🌿 Nature & Outdoors' },
        { value: 'movies', label: '🎬 Movies & TV' },
        { value: 'social', label: '👥 Social Activities' },
        { value: 'volunteering', label: '🤝 Volunteering' },
      ],
    },
    {
      id: 'personality_type',
      type: 'single',
      category: 'Personality',
      question: 'Which personality type resonates most with you?',
      options: [
        { value: 'introvert', label: 'Introvert - I recharge alone' },
        { value: 'extrovert', label: 'Extrovert - I energize with others' },
        { value: 'ambivert', label: 'Ambivert - I balance both' },
      ],
    },
    {
      id: 'communication_style',
      type: 'single',
      category: 'Communication',
      question: 'How do you prefer to communicate?',
      options: [
        { value: 'deep_conversations', label: 'Deep, meaningful conversations' },
        { value: 'casual_chat', label: 'Light, casual chatting' },
        { value: 'listening', label: 'I prefer listening & supporting others' },
        { value: 'mixed', label: 'A mix of everything' },
      ],
    },
    {
      id: 'support_type',
      type: 'multiselect',
      category: 'Support Style',
      question: 'What types of support do you seek or offer? (Select all that apply)',
      options: [
        { value: 'emotional', label: '❤️ Emotional support' },
        { value: 'practical', label: '🛠️ Practical advice' },
        { value: 'motivation', label: '⚡ Motivation & encouragement' },
        { value: 'fun', label: '😊 Fun & distraction' },
        { value: 'accountability', label: '📋 Accountability' },
      ],
    },
    {
      id: 'availability',
      type: 'single',
      category: 'Availability',
      question: 'How often are you available for connecting?',
      options: [
        { value: 'daily', label: 'Daily - I can chat most days' },
        { value: 'several_week', label: 'Several times a week' },
        { value: 'weekly', label: 'Once a week' },
        { value: 'occasional', label: 'Occasionally - when I need support' },
      ],
    },
    {
      id: 'goals',
      type: 'multiselect',
      category: 'Goals',
      question: 'What are your personal growth goals? (Select all that apply)',
      options: [
        { value: 'mental_health', label: '🧠 Mental health improvement' },
        { value: 'fitness', label: '💪 Fitness & wellness' },
        { value: 'career', label: '💼 Career development' },
        { value: 'relationships', label: '💝 Relationship skills' },
        { value: 'creativity', label: '✨ Creative expression' },
        { value: 'learning', label: '📖 Learning & growth' },
        { value: 'financial', label: '💰 Financial goals' },
        { value: 'spirituality', label: '🙏 Spirituality & mindfulness' },
      ],
    },
    {
      id: 'challenges',
      type: 'multiselect',
      category: 'Challenges',
      question: 'What challenges are you currently facing? (Select what you\'re comfortable sharing)',
      options: [
        { value: 'anxiety', label: '😰 Anxiety' },
        { value: 'depression', label: '😔 Depression or low mood' },
        { value: 'stress', label: '😓 Work/life stress' },
        { value: 'loneliness', label: '😢 Loneliness' },
        { value: 'relationships', label: '💔 Relationship difficulties' },
        { value: 'self_esteem', label: '😐 Self-esteem issues' },
        { value: 'motivation', label: '🚫 Lack of motivation' },
        { value: 'none', label: '✅ None - just here to help others' },
      ],
    },
    {
      id: 'timezone',
      type: 'single',
      category: 'Practical',
      question: 'What is your timezone?',
      options: [
        { value: 'pst', label: 'Pacific (PST/PDT)' },
        { value: 'mst', label: 'Mountain (MST/MDT)' },
        { value: 'cst', label: 'Central (CST/CDT)' },
        { value: 'est', label: 'Eastern (EST/EDT)' },
        { value: 'gmt', label: 'GMT/UTC' },
        { value: 'cet', label: 'Central Europe (CET)' },
        { value: 'ist', label: 'India (IST)' },
        { value: 'aest', label: 'Australia (AEST)' },
        { value: 'other', label: 'Other' },
      ],
    },
  ];

  // Load existing questionnaire data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { data, error } = await supabase
          .from('user_questionnaires')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSavedData(data);
          setAnswers(data.answers || {});
        }
      } catch (err) {
        console.error('Error loading questionnaire:', err);
        setError('Failed to load existing responses');
      }
    };

    if (userId) {
      loadExistingData();
    }
  }, [userId]);

  const handleAnswer = (questionId, value) => {
    const question = QUESTIONS[currentStep];
    if (question.type === 'multiselect') {
      const current = answers[questionId] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleNext = () => {
    const currentQuestion = QUESTIONS[currentStep];
    const answer = answers[currentQuestion.id];

    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      setError('Please select at least one option before continuing');
      return;
    }

    setError(null);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const questionnireData = {
        user_id: userId,
        answers,
        completed_at: new Date().toISOString(),
        version: 1,
      };

      if (savedData) {
        const { error } = await supabase
          .from('user_questionnaires')
          .update(questionnireData)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_questionnaires')
          .insert([questionnireData]);

        if (error) throw error;
      }

      // Update user profile to mark questionnaire as complete
      await supabase
        .from('users')
        .update({ questionnaire_completed: true })
        .eq('id', userId);

      setSavedData(questionnireData);
      if (onComplete) {
        onComplete(questionnireData);
      }
    } catch (err) {
      console.error('Error saving questionnaire:', err);
      setError('Failed to save your responses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSummary) {
    return (
      <QuestionnaireSummary
        answers={answers}
        questions={QUESTIONS}
        onEdit={() => setShowSummary(false)}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    );
  }

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <QuestionnaireProgress
          current={currentStep + 1}
          total={QUESTIONS.length}
          percentage={progress}
        />

        <div className="questionnaire-content">
          <div className="questionnaire-category">
            {currentQuestion.category}
          </div>

          <QuestionnaireQuestion
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswer(currentQuestion.id, value)}
          />

          {error && <div className="questionnaire-error">{error}</div>}
        </div>

        <div className="questionnaire-actions">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="btn-secondary"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="btn-primary"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Review' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

Questionnaire.propTypes = {
  userId: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
};

Questionnaire.defaultProps = {
  onComplete: null,
};

export default Questionnaire;
```

[FILE: src/components/Questionnaire/Questionnaire.css]
```css
.questionnaire-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff3e6 0%, #fef3c7 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
}

.questionnaire-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05);
  padding: 32px;
  max-width: 600px;
  width: 100%;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.questionnaire-content {
  margin: 32px 0;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.questionnaire-category {
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.questionnaire-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  border-left: 4px solid #dc2626;
}

.questionnaire-actions {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background-color: #f59e0b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #d1d5db;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640
