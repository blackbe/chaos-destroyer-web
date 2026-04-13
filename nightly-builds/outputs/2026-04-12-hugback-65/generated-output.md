# HugBack Feature #65: User Profiles

I'll build a complete user profile feature with bio and interests management.

## File Structure
```
~/hugback/src/components/Profile.js (enhanced)
~/hugback/src/components/Profile.css (new)
~/hugback/src/components/EditProfile.js (new)
~/hugback/src/components/EditProfile.css (new)
~/hugback/src/components/ViewProfile.js (new)
~/hugback/src/components/ViewProfile.css (new)
~/hugback/backend/routes/profiles.js (new)
~/hugback/backend/migrations/2024-01-15-user-profiles.sql (new)
~/hugback/README_FEATURE_65.md
~/hugback/SCREENSHOTS.md
```

---

## DATABASE MIGRATION

[FILE: backend/migrations/2024-01-15-user-profiles.sql]
```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT,
  interests TEXT[], -- Array of interest strings
  looking_for VARCHAR(50), -- 'support', 'connection', 'both'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at_trigger
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();
```

---

## BACKEND ROUTES

[FILE: backend/routes/profiles.js]
```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyAuth } = require('../middleware/auth');

// Get profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get profile by username
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update own profile
router.put('/', verifyAuth, async (req, res) => {
  try {
    const { bio, interests, looking_for } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be 500 characters or less' });
    }

    if (interests && !Array.isArray(interests)) {
      return res.status(400).json({ error: 'Interests must be an array' });
    }

    if (interests && interests.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 interests allowed' });
    }

    if (looking_for && !['support', 'connection', 'both'].includes(looking_for)) {
      return res.status(400).json({ error: 'Invalid looking_for value' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        bio: bio || null,
        interests: interests || [],
        looking_for: looking_for || null,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create profile (called on first signup)
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { username, bio, interests, looking_for } = req.body;
    const userId = req.user.id;

    // Validate username
    if (!username || username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters' });
    }

    // Check if username is unique
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          username,
          bio: bio || null,
          interests: interests || [],
          looking_for: looking_for || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Check username availability
router.get('/check/availability/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.length < 3) {
      return res.json({ available: false });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username);

    if (error) throw error;

    res.json({ available: !data || data.length === 0 });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

module.exports = router;
```

---

## FRONTEND COMPONENTS

[FILE: src/components/Profile.js]
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import EditProfile from './EditProfile';
import ViewProfile from './ViewProfile';
import './Profile.css';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/profiles/${user.id}`
      );

      if (!response.ok) {
        if (response.status === 404[FIL          // New user, show se```j   import React, { useState, u          setProfile(nullimp          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setIsOwnProfile(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-container profile-loading">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={() => {
              setError(null);
              fetchProfile();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isEditing || !profile) {
    return (
      <EditProfile
        user={user}
        initialProfile={profile}
        onSave={handleProfileUpdate}
        onCancel={() => {
          if (!profile) {
            navigate('/home');
          } else {
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <div className="profile-container">
      <ViewProfile
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
};

Profile.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string,
  }),
};

export default Profile;
```

[FILE: src/components/Profile.css]
```css
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff3e6 0%, #fef5e7 100%);
  padding: 20px;
}

.profile-loading,
.profile-loading .loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  min-height: 300px;
  font-size: 16px;
  color: #8b6f47;
}

.error-state {
  background: white;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  margin: 40px auto;
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
}

.error-state p {
  color: #d97706;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-primary {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .error-state {
    padding: 24px;
  }
}
```

[FILE: src/components/EditProfile.js]
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './EditProfile.css';

const INTEREST_SUGGESTIONS = [
  'Mental Health',
  'Anxiety',
  'Depression',
  'Stress Management',
  'Meditation',
  'Yoga',
  'Fitness',
  'Nutrition',
  'Sleep',
  'Work-Life Balance',
  'Relationships',
  'Family',
  'Career',
  'Personal Growth',
  'Mindfulness',
  'Journaling',
  'Art',
  'Music',
  'Nature',
  'Community',
];

const EditProfile = ({ user, initialProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    interests: [],
    looking_for: 'both',
  });

  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        username: initialProfile.username || '',
        bio: initialProfile.bio || '',
        interests: initialProfile.interests || [],
        looking_for: initialProfile.looking_for || 'both',
      });
    }
  }, [initialProfile]);

  // Debounced username availability check
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    if (initialProfile && formData.username === initialProfile.username) {
      setUsernameAvailable(true);
      setUsernameError('');
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, initialProfile]);

  const checkUsernameAvailability = async (username) => {
    try {
      setUsernameChecking(true);
      const response = await fetch(
        `${process.env.
assName="profile-interests-empty">
              {isOwn ? 'No interests added yet' : 'No interests shared'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
    interests: PropTypes.arrayOf(PropTypes.string),
    avatar_color: PropTypes.string,
    created_at: PropTypes.string.
