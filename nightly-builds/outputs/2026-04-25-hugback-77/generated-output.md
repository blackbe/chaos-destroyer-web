# HugBack Safety Resources Page - Feature #77

I'll build a comprehensive safety resources page with crisis hotlines, mental health resources, self-care tools, and emergency contacts.

---

## [FILE: src/components/SafetyResources.js]

```jsx
import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle, Phone, MessageCircle, Globe, BookOpen, Loader } from 'lucide-react';
import PropTypes from 'prop-types';
import './SafetyResources.css';

const SafetyResources = () => {
  const [activeCategory, setActiveCategory] = useState('crisis');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetchResources();
    loadBookmarks();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/safety-resources`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setResources(getDefaultResources());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem('safetyResourceBookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    }
  };

  const toggleBookmark = (resourceId) => {
    const updated = bookmarks.includes(resourceId)
      ? bookmarks.filter(id => id !== resourceId)
      : [...bookmarks, resourceId];
    setBookmarks(updated);
    localStorage.setItem('safetyResourceBookmarks', JSON.stringify(updated));
  };

  const getDefaultResources = () => [
    {
      id: 'crisis-988',
      category: 'crisis',
      name: '988 Suicide & Crisis Lifeline',
      description: 'Free, confidential support 24/7 for people in suicidal crisis or emotional distress.',
      phone: '988',
      type: 'hotline',
      countries: ['USA'],
      tags: ['suicide', 'crisis', 'immediate-help'],
      website: 'https://988lifeline.org'
    },
    {
      id: 'crisis-textline',
      category: 'crisis',
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741. Free crisis counseling via text message, 24/7.',
      phone: 'Text HOME to 741741',
      type: 'text',
      countries: ['USA', 'Canada', 'UK'],
      tags: ['crisis', 'text-support'],
      website: 'https://www.crisistextline.org'
    },
    {
      id: 'crisis-international',
      category: 'crisis',
      name: 'International Association for Suicide Prevention',
      description: 'Find crisis centers and hotlines in your country.',
      type: 'directory',
      countries: ['International'],
      tags: ['crisis', 'international', 'directory'],
      website: 'https://www.iasp.info/resources/Crisis_Centres/'
    },
    {
      id: 'mental-nami',
      category: 'mental-health',
      name: 'NAMI - National Alliance on Mental Illness',
      description: 'Helpline, support groups, education, and advocacy for mental health.',
      phone: '1-800-950-NAMI (6264)',
      type: 'helpline',
      countries: ['USA'],
      tags: ['mental-health', 'support-groups', 'education'],
      website: 'https://www.nami.org'
    },
    {
      id: 'mental-nimh',
      category: 'mental-health',
      name: 'NIMH - National Institute of Mental Health',
      description: 'Information about mental health conditions, treatments, and research.',
      type: 'educational',
      countries: ['USA'],
      tags: ['mental-health', 'education', 'information'],
      website: 'https://www.nimh.nih.gov'
    },
    {
      id: 'substance-samhsa',
      category: 'substance-abuse',
      name: 'SAMHSA National Helpline',
      description: 'Free, confidential treatment referral and information service for substance abuse.',
      phone: '1-800-662-4357',
      type: 'helpline',
      countries: ['USA'],
      tags: ['substance-abuse', 'addiction', 'treatment'],
      website: 'https://www.samhsa.gov/find-help/national-helpline'
    },
    {
      id: 'abuse-rainn',
      category: 'abuse',
      name: 'RAINN - Rape, Abuse & Incest National Network',
      description: 'Confidential support for sexual assault survivors and loved ones.',
      phone: '1-800-656-4673',
      type: 'hotline',
      countries: ['USA'],
      tags: ['sexual-assault', 'abuse', 'confidential'],
      website: 'https://www.rainn.org'
    },
    {
      id: 'abuse-ndvh',
      category: 'abuse',
      name: 'National Domestic Violence Hotline',
      description: 'Free, confidential support for domestic violence victims and those concerned.',
      phone: '1-800-799-7233',
      type: 'hotline',
      countries: ['USA'],
      tags: ['domestic-violence', 'abuse', 'safety-planning'],
      website: 'https://www.thehotline.org'
    },
    {
      id: 'self-care-headspace',
      category: 'self-care',
      name: 'Headspace',
      description: 'Meditation and mindfulness app with sleep, stress, and anxiety programs.',
      type: 'app',
      countries: ['International'],
      tags: ['meditation', 'mindfulness', 'sleep', 'anxiety'],
      website: 'https://www.headspace.com'
    },
    {
      id: 'self-care-calm',
      category: 'self-care',
      name: 'Calm',
      description: 'Meditation, sleep stories, music, and masterclasses for mental wellness.',
      type: 'app',
      countries: ['International'],
      tags: ['meditation', 'sleep', 'relaxation'],
      website: 'https://www.calm.com'
    }
  ];

  const categories = [
    { id: 'crisis', label: 'Crisis Support', icon: AlertCircle },
    { id: 'mental-health', label: 'Mental Health', icon: Heart },
    { id: 'substance-abuse', label: 'Substance Abuse', icon: Phone },
    { id: 'abuse', label: 'Abuse Support', icon: BookOpen },
    { id: 'self-care', label: 'Self-Care Tools', icon: Globe }
  ];

  const filteredResources = resources.filter(r => r.category === activeCategory);

  const CategoryIcon = categories.find(c => c.id === activeCategory)?.icon || AlertCircle;

  const handleCall = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  const handleText = (text) => {
    if (text.includes('741741')) {
      window.location.href = 'sms:741741?body=HOME';
    }
  };

  return (
    <div className="safety-resources-container">
      {/* Header */}
      <div className="sr-header">
        <div className="sr-header-content">
          <h1>Safety & Support Resources</h1>
          <p>Find help anytime. You're not alone.</p>
        </div>
      </div>

      {/* Category Navigation */}
      <nav className="sr-categories">
        {categories.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              className={`sr-category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
            >
              <IconComponent size={20} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Loading State */}
      {loading && (
        <div className="sr-loading">
          <Loader className="spin" size={40} />
          <p>Loading resources...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="sr-error" role="alert">
          <AlertCircle size={20} />
          <div>
            <p className="sr-error-title">Unable to load resources</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {!loading && (
        <div className="sr-resources">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isBookmarked={bookmarks.includes(resource.id)}
                onBookmark={toggleBookmark}
                onCall={handleCall}
                onText={handleText}
              />
            ))
          ) : (
            <div className="sr-empty">
              <p>No resources found in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Access Panel */}
      <div className="sr-quick-access">
        <h3>Quick Access</h3>
        {bookmarks.length > 0 ? (
          <div className="sr-bookmarks">
            {resources
              .filter(r => bookmarks.includes(r.id))
              .slice(0, 3)
              .map(resource => (
                <a
                  key={resource.id}
                  href={resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sr-bookmark-item"
                >
                  <span>{resource.name}</span>
                  <Globe size={16} />
                </a>
              ))}
          </div>
        ) : (
          <p className="sr-no-bookmarks">
            Bookmark resources by clicking the heart icon for quick access.
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="sr-disclaimer">
        <p>
          <strong>Crisis? In immediate danger?</strong> Call 911 (USA) or your local emergency number.
          These resources are supplementary and not a substitute for professional mental health care.
        </p>
      </div>
    </div>
  );
};

/**
 * ResourceCard Component
 */
const ResourceCard = ({ resource, isBookmarked, onBookmark, onCall, onText }) => {
  return (
    <article className="sr-card" aria-label={resource.name}>
      <div className="sr-card-header">
        <div>
          <h2 className="sr-card-title">{resource.name}</h2>
          <div className="sr-card-meta">
            {resource.countries && (
              <span className="sr-country">{resource.countries.join(', ')}</span>
            )}
            <span className={`sr-type sr-type-${resource.type}`}>{resource.type}</span>
          </div>
        </div>
        <button
          className={`sr-bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={() => onBookmark(resource.id)}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Heart size={24} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="sr-card-description">{resource.description}</p>

      {resource.tags && resource.tags.length > 0 && (
        <div className="sr-tags">
          {resource.tags.map(tag => (
            <span key={tag} className="sr-tag">
              {tag.replace('-', ' ')}
            </span>
          ))}
        </div>
      )}

      <div className="sr-card-actions">
        {resource.phone && (
          <>
            <button
              className="sr-action-btn sr-action-call"
              onClick={() => onCall(resource.phone)}
              aria-label={`Call ${resource.name}`}
            >
              <Phone size={18} />
              <span>{resource.phone}</span>
            </button>
            {resource.phone.includes('741') && (
              <button
                className="sr-action-btn sr-action-text"
                onClick={() => onText(resource.phone)}
                aria-label={`Text ${resource.name}`}
              >
                <MessageCircle size={18} />
                <span>Text</span>
              </button>
            )}
          </>
        )}
        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="sr-action-btn sr-action-link"
            aria-label={`Visit ${resource.name} website`}
          >
            <Globe size={18} />
            <span>Visit Site</span>
          </a>
        )}
      </div>
    </article>
  );
};

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.required,
    name: PropTypes.string.required,
    description: PropTypes.string.required,
    phone: PropTypes.string,
    website: PropTypes.string,
    type: PropTypes.string,
    countries: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isBookmarked: PropTypes.bool.isRequired,
  onBookmark: PropTypes.func.isRequired,
  onCall: PropTypes.func.isRequired,
  onText: PropTypes.func.isRequired
};

SafetyResources.propTypes = {};

export default SafetyResources;
```

---

## [FILE: src/components/SafetyResources.css]

```css
.safety-resources-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff3e6 0%, #fffbf0 100%);
  padding-bottom: 60px;
}

/* Header */
.sr-header {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

.sr-header-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0
