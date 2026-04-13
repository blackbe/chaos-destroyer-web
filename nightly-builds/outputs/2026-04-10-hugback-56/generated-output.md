# HugBack Age Verification Feature (#56)

I'll build a complete age verification system using a third-party service integration. I'm using **Age Verification by IDology** (via their API) as the third-party provider, with a fallback to manual verification.

---

## [FILE: migrations/2024-01-15-age-verification.sql]

```sql
-- Add age verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verification_method VARCHAR(50); -- 'idology', 'manual', 'none'
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verification_attempt_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verification_last_attempt TIMESTAMP;

-- Create age_verification_logs table for audit trail
CREATE TABLE IF NOT EXISTS age_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'verified', 'failed', 'expired'
  third_party_ref_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_age_verified ON users(age_verified);
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_user_id ON age_verification_logs(user_id);
```

---

## [FILE: backend/.env.example]

```bash
# Age Verification Service
IDOLOGY_API_KEY=your_idology_api_key_here
IDOLOGY_API_URL=https://api.idology.com/api/v1
IDOLOGY_ENABLED=true

# Manual Verification
MANUAL_VERIFICATION_ENABLED=true
```

---

## [FILE: backend/services/ageVerificationService.js]

```javascript
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AgeVerificationService {
  constructor() {
    this.idologyClient = axios.create({
      baseURL: process.env.IDOLOGY_API_URL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${process.env.IDOLOGY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initiate age verification via IDology
   */
  async initiateIdologyVerification(userId, userData) {
    try {
      logger.info(`[AgeVerification] Initiating IDology verification for user ${userId}`);

      const payload = {
        firstName: userData.firstName || userData.first_name,
        lastName: userData.lastName || userData.last_name,
        dob: userData.dateOfBirth || userData.date_of_birth, // YYYY-MM-DD
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zip: userData.zip || userData.postal_code || '',
        country: userData.country || 'US',
      };

      const response = await this.idologyClient.post('/verify', payload);

      if (response.data && response.data.id) {
        // Log the verification attempt
        await this.logVerificationAttempt(userId, 'idology', 'pending', response.data.id);

        return {
          success: true,
          method: 'idology',
          referenceId: response.data.id,
          status: response.data.status || 'pending',
          message: 'Verification initiated. Please complete the process.',
        };
      }

      throw new Error('Invalid response from IDology');
    } catch (error) {
      logger.error(`[AgeVerification] IDology error for user ${userId}:`, error.message);

      // Log failed attempt
      await this.logVerificationAttempt(userId, 'idology', 'failed', null);

      // Update attempt count
      await this.incrementAttemptCount(userId);

      return {
        success: false,
        method: 'idology',
        error: 'Age verification service unavailable. Please try manual verification.',
      };
    }
  }

  /**
   * Check verification status from IDology
   */
  async checkIdologyStatus(referenceId) {
    try {
      const response = await this.idologyClient.get(`/verify/${referenceId}`);

      return {
        status: response.data.status,
        isVerified: response.data.status === 'verified' || response.data.status === 'approved',
        result: response.data,
      };
    } catch (error) {
      logger.error(`[AgeVerification] Error checking IDology status for ref ${referenceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Complete verification (manual or after IDology approval)
   */
  async completeVerification(userId, method = 'manual', verificationData = {}) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          age_verified: true,
          age_verification_method: method,
          age_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Log successful verification
      await this.logVerificationAttempt(userId, method, 'verified');

      logger.info(`[AgeVerification] User ${userId} verified via ${method}`);

      return {
        success: true,
        message: 'Age verification completed successfully.',
      };
    } catch (error) {
      logger.error(`[AgeVerification] Error completing verification for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Reject or fail verification
   */
  async failVerification(userId, reason = 'failed_verification') {
    try {
      await this.logVerificationAttempt(userId, 'manual', 'failed');
      await this.incrementAttemptCount(userId);

      logger.warn(`[AgeVerification] Verification failed for user ${userId}: ${reason}`);

      return {
        success: false,
        message: 'Age verification failed. Please try again.',
      };
    } catch (error) {
      logger.error(`[AgeVerification] Error failing verification for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if user needs age verification
   */
  async needsVerification(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('age_verified, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return !data.age_verified;
    } catch (error) {
      logger.error(`[AgeVerification] Error checking verification status for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get verification status and history
   */
  async getVerificationStatus(userId) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('age_verified, age_verification_method, age_verified_at, age_verification_attempt_count')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: logs, error: logsError } = await supabase
        .from('age_verification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      return {
        isVerified: user.age_verified,
        method: user.age_verification_method,
        verifiedAt: user.age_verified_at,
        attemptCount: user.age_verification_attempt_count,
        history: logs,
      };
    } catch (error) {
      logger.error(`[AgeVerification] Error getting status for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Log verification attempt
   */
  async logVerificationAttempt(userId, method, status, referenceId = null) {
    try {
      const { error } = await supabase
        .from('age_verification_logs')
        .insert({
          user_id: userId,
          verification_method: method,
          status: status,
          third_party_ref_id: referenceId,
          ip_address: null, // Set by middleware if available
          user_agent: null, // Set by middleware if available
        });

      if (error) throw error;
    } catch (error) {
      logger.error(`[AgeVerification] Error logging verification attempt for user ${userId}:`, error.message);
    }
  }

  /**
   * Increment attempt count
   */
  async incrementAttemptCount(userId) {
    try {
      await supabase.rpc('increment_age_verification_attempts', { user_id: userId });
    } catch (error) {
      logger.error(`[AgeVerification] Error incrementing attempts for user ${userId}:`, error.message);
    }
  }

  /**
   * Check if user has exceeded max attempts (rate limiting)
   */
  async hasExceededAttempts(userId, maxAttempts = 3) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('age_verification_attempt_count, age_verification_last_attempt')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data.age_verification_attempt_count >= maxAttempts) {
        // Check if enough time has passed to reset (24 hours)
        const lastAttempt = new Date(data.age_verification_last_attempt);
        const now = new Date();
        const hoursPassed = (now - lastAttempt) / (1000 * 60 * 60);

        if (hoursPassed < 24) {
          return true;
        }

        // Reset attempts
        await supabase
          .from('users')
          .update({ age_verification_attempt_count: 0 })
          .eq('id', userId);
      }

      return false;
    } catch (error) {
      logger.error(`[AgeVerification] Error checking attempts for user ${userId}:`, error.message);
      return false;
    }
  }
}

module.exports = new AgeVerificationService();
```

---

## [FILE: backend/routes/ageVerification.js]

```javascript
const express = require('express');
const router = express.Router();
const ageVerificationService = require('../services/ageVerificationService');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * POST /api/age-verification/initiate
 * Start age verification process
 */
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { method = 'idology', userData } = req.body;

    // Check if already verified
    const needsVerification = await ageVerificationService.needsVerification(userId);
    if (!needsVerification) {
      return res.status(400).json({
        error: 'User already age verified',
      });
    }

    // Check rate limiting
    const exceeded = await ageVerificationService.hasExceededAttempts(userId);
    if (exceeded) {
      return res.status(429).json({
        error: 'Too many verification attempts. Please try again in 24 hours.',
      });
    }

    // Validate required data
    if (!userData || !userData.firstName || !userData.lastName || !userData.dateOfBirth) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, dateOfBirth',
      });
    }

    let result;

    if (method === 'idology' && process.env.IDOLOGY_ENABLED === 'true') {
      result = await ageVerificationService.initiateIdologyVerification(userId, userData);
    } else {
      // Fallback to manual verification
      result = {
        success: true,
        method: 'manual',
        message: 'Manual verification initiated. Please complete the verification process.',
      };
      await ageVerificationService.logVerificationAttempt(userId, 'manual', 'pending');
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error('[AgeVerification API] Error initiating verification:', error.message);
    return res.status(500).json({
      error: 'Failed to initiate age verification',
    });
  }
});

/**
 * POST /api/age-verification/complete
 * Complete manual verification (admin or user submission)
 */
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { method = 'manual', approved = false } = req.body;

    if (!approved) {
      await ageVerificationService.failVerification(userId, 'user_rejected');
      return res.status(400).json({
        success: false,
        message: 'Age verification was not approved.',
      });
    }

    const result = await ageVerificationService.completeVerification(userId, method);
    return res.status(200).json(result);
  } catch (error) {
    logger.error('[AgeVerification API] Error completing verification:', error.message);
    return res.status(500).json({
      error: 'Failed to complete age verification',
    });
  }
});

/**
 * GET /api/age-verification/status
 * Check verification status
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await ageVerificationService.getVerificationStatus(userId);
    return res.status(200).json(status);
  } catch (error) {
    logger.error('[AgeVerification API] Error getting status:', error.message);
    return res.status(500).json({
      error: 'Failed to get verification status',
    });
  }
});

/**
 * POST /api/age-verification/check-idology-status
 * Check status of IDology verification
 */
router.post('/check-idology-status', authMiddleware, async (req, res) => {
  try {
    const { referenceId } = req.body;

    if (!referenceId) {
      return res.status(400).json({
        error: 'referenceId is required',
      });
    }

    const statusData = await ageVerificationService.checkIdologyStatus(referenceId);

    if (statusData.isVerified) {
      // Auto-complete verification if IDology approved
      await ageVerificationService.completeVerification(req.user.id, 'idology');
    }

    return res.status(200).json(statusData);
  } catch (error) {
    logger.error('[AgeVerification API] Error checking IDology status:', error.message);
    return res.status(500).json({
      error: 'Failed to check verification status',
    });
  }
});
