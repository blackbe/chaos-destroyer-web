# HugBack Feature #63: Basic Compatibility Matching

I'll build a rule-based compatibility matching system that helps users find suitable peer support matches based on their profiles.

---

## [FILE: migrations/2024-01-15-compatibility-matching.sql]

```sql
-- Add compatibility fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS support_areas TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'flexible';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'English';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT DEFAULT '18-25';

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score NUMERIC(3,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  match_reasons TEXT[] DEFAULT '{}',
  matched_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id),
  CONSTRAINT different_users CHECK (user_a_id != user_b_id)
);

CREATE INDEX idx_matches_user_a ON matches(user_a_id);
CREATE INDEX idx_matches_user_b ON matches(user_b_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);

-- Add match history tracking
CREATE TABLE IF NOT EXISTS match_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_interactions_match ON match_interactions(match_id);
CREATE INDEX idx_match_interactions_user ON match_interactions(user_id);
```

---

## [FILE: backend/services/compatibilityService.js]

```javascript
const { supabase } = require('../config/supabase');

const COMPATIBILITY_WEIGHTS = {
  SHARED_INTERESTS: 0.25,
  SHARED_SUPPORT_AREAS: 0.35,
  AVAILABILITY_MATCH: 0.15,
  LANGUAGE_MATCH: 0.15,
  AGE_PROXIMITY: 0.1,
};

const AGE_RANGES = {
  '13-17': 0,
  '18-25': 1,
  '26-35': 2,
  '36-50': 3,
  '50+': 4,
};

class CompatibilityService {
  /**
   * Calculate compatibility score between two users
   * @param {Object} userProfile - Profile of user A
   * @param {Object} candidateProfile - Profile of user B
   * @returns {Object} { score: 0-1, reasons: [] }
   */
  calculateCompatibility(userProfile, candidateProfile) {
    const scores = {
      interestScore: this._calculateInterestOverlap(
        userProfile.interests || [],
        candidateProfile.interests || []
      ),
      supportScore: this._calculateSupportOverlap(
        userProfile.support_areas || [],
        candidateProfile.support_areas || []
      ),
      availabilityScore: this._calculateAvailabilityMatch(
        userProfile.availability,
        candidateProfile.availability
      ),
      languageScore: this._calculateLanguageMatch(
        userProfile.language_preference,
        candidateProfile.language_preference
      ),
      ageScore: this._calculateAgeProximity(
        userProfile.age_range,
        candidateProfile.age_range
      ),
    };

    const totalScore =
      scores.interestScore * COMPATIBILITY_WEIGHTS.SHARED_INTERESTS +
      scores.supportScore * COMPATIBILITY_WEIGHTS.SHARED_SUPPORT_AREAS +
      scores.availabilityScore * COMPATIBILITY_WEIGHTS.AVAILABILITY_MATCH +
      scores.languageScore * COMPATIBILITY_WEIGHTS.LANGUAGE_MATCH +
      scores.ageScore * COMPATIBILITY_WEIGHTS.AGE_PROXIMITY;

    const reasons = this._generateReasons(scores);

    return {
      score: Math.round(totalScore * 100) / 100,
      reasons,
      breakdown: scores,
    };
  }

  /**
   * Find compatible matches for a user
   * @param {string} userId - User ID to find matches for
   * @param {Object} options - { limit, minScore, excludeMatched }
   * @returns {Promise<Array>} Array of potential matches
   */
  async findMatches(userId, options = {}) {
    const {
      limit = 10,
      minScore = 0.5,
      excludeMatched = true,
    } = options;

    try {
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get all other users
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('visibility', 'public');

      const { data: candidates, error: candidateError } = await query;

      if (candidateError) throw candidateError;

      // Get existing matches if needed
      let existingMatches = [];
      if (excludeMatched) {
        const { data: matches } = await supabase
          .from('matches')
          .select('user_a_id, user_b_id')
          .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
          .in('status', ['matched', 'pending']);

        existingMatches = new Set();
        matches?.forEach((m) => {
          existingMatches.add(
            m.user_a_id === userId ? m.user_b_id : m.user_a_id
          );
        });
      }

      // Calculate compatibility for each candidate
      const compatibilities = candidates
        .filter((candidate) => !existingMatches.has(candidate.id))
        .map((candidate) => {
          const compat = this.calculateCompatibility(
            userProfile,
            candidate
          );
          return {
            ...candidate,
            compatibilityScore: compat.score,
            matchReasons: compat.reasons,
          };
        })
        .filter((c) => c.compatibilityScore >= minScore)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, limit);

      return compatibilities;
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }

  /**
   * Save match to database
   * @param {string} userAId - First user ID
   * @param {string} userBId - Second user ID
   * @param {number} score - Compatibility score
   * @param {Array} reasons - Match reasons
   * @returns {Promise<Object>} Match record
   */
  async saveMatch(userAId, userBId, score, reasons) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            user_a_id: userAId,
            user_b_id: userBId,
            compatibility_score: score,
            match_reasons: reasons,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving match:', error);
      throw error;
    }
  }

  /**
   * Get all matches for a user
   * @param {string} userId - User ID
   * @param {string} status - Filter by status (pending, matched, rejected)
   * @returns {Promise<Array>} Array of matches with profile data
   */
  async getUserMatches(userId, status = 'pending') {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          id,
          user_a_id,
          user_b_id,
          compatibility_score,
          match_reasons,
          matched_at,
          status,
          profiles!user_a_id(id, full_name, avatar_url, headline),
          profiles!user_b_id(id, full_name, avatar_url, headline)
        `
        )
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .eq('status', status)
        .order('compatibility_score', { ascending: false });

      if (error) throw error;

      // Normalize response
      return data.map((match) => ({
        ...match,
        profile:
          match.user_a_id === userId
            ? match.profiles__user_b_id
            : match.profiles__user_a_id,
        otherUserId:
          match.user_a_id === userId ? match.user_b_id : match.user_a_id,
      }));
    } catch (error) {
      console.error('Error getting user matches:', error);
      throw error;
    }
  }

  /**
   * Update match status
   * @param {string} matchId - Match ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated match
   */
  async updateMatchStatus(matchId, status) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ status, matched_at: new Date() })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating match status:', error);
      throw error;
    }
  }

  // Private helper methods

  _calculateInterestOverlap(userInterests, candidateInterests) {
    if (
      userInterests.length === 0 ||
      candidateInterests.length === 0
    ) {
      return 0.3; // Default partial score if no interests provided
    }

    const overlap = userInterests.filter((i) =>
      candidateInterests.includes(i)
    ).length;

    return Math.min(overlap / Math.max(userInterests.length, 1), 1);
  }

  _calculateSupportOverlap(userAreas, candidateAreas) {
    if (userAreas.length === 0 || candidateAreas.length === 0) {
      return 0.4; // Default higher score for support areas
    }

    const overlap = userAreas.filter((a) =>
      candidateAreas.includes(a)
    ).length;

    return Math.min(overlap / Math.max(userAreas.length, 1), 1);
  }

  _calculateAvailabilityMatch(userAvail, candidateAvail) {
    if (userAvail === candidateAvail) return 1;
    if (userAvail === 'flexible' || candidateAvail === 'flexible') return 0.8;
    return 0.4;
  }

  _calculateLanguageMatch(userLang, candidateLang) {
    return userLang === candidateLang ? 1 : 0.5;
  }

  _calculateAgeProximity(userAge, candidateAge) {
    const userIdx = AGE_RANGES[userAge] ?? 1;
    const candIdx = AGE_RANGES[candidateAge] ?? 1;
    const diff = Math.abs(userIdx - candIdx);

    if (diff === 0) return 1;
    if (diff === 1) return 0.8;
    if (diff === 2) return 0.5;
    return 0.2;
  }

  _generateReasons(scores) {
    const reasons = [];

    if (scores.interestScore >= 0.5) {
      reasons.push('Shared interests');
    }
    if (scores.supportScore >= 0.5) {
      reasons.push('Similar support needs');
    }
    if (scores.availabilityScore >= 0.8) {
      reasons.push('Compatible availability');
    }
    if (scores.languageScore === 1) {
      reasons.push('Same language');
    }
    if (scores.ageScore >= 0.8) {
      reasons.push('Similar age group');
    }

    return reasons;
  }
}

module.exports = new CompatibilityService();
```

---

## [FILE: backend/routes/matches.js]

```javascript
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const compatibilityService = require('../services/compatibilityService');

// Get potential matches for current user
router.get('/potential', authMiddleware, async (req, res) => {
  try {
    const { limit = 10, minScore = 0.5 } = req.query;

    const matches = await compatibilityService.findMatches(
      req.user.id,
      {
        limit: parseInt(limit),
        minScore: parseFloat(minScore),
        excludeMatched: true,
      }
    );

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get current user's matches
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const matches = await compatibilityService.getUserMatches(
      req.user.id,
      status
    );

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Accept/reject a match
router.put('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
      });
    }

    const status = action === 'accept' ? 'matched' : 'rejected';

    const match = await compatibilityService.updateMatchStatus(
      matchId,
      status
    );

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get match details
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        profiles!user_a_id(*),
        profiles!user_b_id(*)
      `
      )
