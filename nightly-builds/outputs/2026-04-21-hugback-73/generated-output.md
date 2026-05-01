# HugBack Background Check Integration (Feature #73)

I'll build a complete, production-ready background check integration via Checkr API. This includes frontend UI, backend API routes, database schema, and comprehensive testing.

## File Structure Overview
```
Frontend: src/components/BackgroundCheck/
Backend: backend/routes/backgroundCheck.js, backend/services/checkrService.js
Database: Supabase migrations
Tests: Included test files
```

---

[FILE: migrations/2024-01-15-background-check-integration.sql]
```sql
-- Create background_checks table
CREATE TABLE IF NOT EXISTS background_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkr_candidate_id VARCHAR(255) UNIQUE,
  checkr_report_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, initiated, completed, clear, suspended, adverse_action
  report_status VARCHAR(50), -- clear, consider, suspended, adversely_decided
  completion_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'initiated', 'completed', 'clear', 'suspended', 'adverse_action'))
);

-- Create background_check_results table for detailed findings
CREATE TABLE IF NOT EXISTS background_check_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  background_check_id UUID NOT NULL REFERENCES background_checks(id) ON DELETE CASCADE,
  check_type VARCHAR(100) NOT NULL, -- ssn_trace, criminal_search, etc.
  result VARCHAR(50) NOT NULL, -- clear, hit, not_ordered, not_available
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create background_check_audit_logs table for compliance
CREATE TABLE IF NOT EXISTS background_check_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  background_check_id UUID NOT NULL REFERENCES background_checks(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_background_checks_user_id ON background_checks(user_id);
CREATE INDEX idx_background_checks_status ON background_checks(status);
CREATE INDEX idx_background_checks_checkr_candidate_id ON background_checks(checkr_candidate_id);
CREATE INDEX idx_background_check_results_check_id ON background_check_results(background_check_id);
CREATE INDEX idx_background_check_audit_logs_check_id ON background_check_audit_logs(background_check_id);

-- Add background_check_verified column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_check_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_check_verified_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_check_consent_date TIMESTAMP;

-- Enable RLS
ALTER TABLE background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_check_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own background checks" 
  ON background_checks FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Service role can insert background checks" 
  ON background_checks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can update background checks" 
  ON background_checks FOR UPDATE 
  WITH CHECK (true);

CREATE POLICY "Users can view their own check results" 
  ON background_check_results FOR SELECT 
  USING (background_check_id IN (SELECT id FROM background_checks WHERE user_id = auth.uid()));
```

---

[FILE: backend/services/checkrService.js]
```javascript
const axios = require('axios');
const { supabase } = require('../config/supabaseClient');
const logger = require('../utils/logger');

const CHECKR_API_BASE = 'https://api.checkr.com/v1';
const CHECKR_API_KEY = process.env.CHECKR_API_KEY;

if (!CHECKR_API_KEY) {
  logger.warn('CHECKR_API_KEY not configured');
}

const checkrClient = axios.create({
  baseURL: CHECKR_API_BASE,
  auth: {
    username: CHECKR_API_KEY,
    password: '',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a Checkr candidate
 * @param {Object} candidateData - User data for background check
 * @returns {Promise<Object>} Checkr candidate object
 */
const createCandidate = async (candidateData) => {
  try {
    logger.info('Creating Checkr candidate', { userId: candidateData.user_id });

    const response = await checkrClient.post('/candidates', {
      first_name: candidateData.first_name,
      last_name: candidateData.last_name,
      email: candidateData.email,
      phone: candidateData.phone || '',
      zipcode: candidateData.zipcode || '',
      dob: candidateData.dob, // YYYY-MM-DD format
      ssn: candidateData.ssn, // Only collected if user consents
      middle_name: candidateData.middle_name || '',
    });

    logger.info('Checkr candidate created', { 
      candidateId: response.data.id,
      userId: candidateData.user_id 
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to create Checkr candidate', {
      error: error.message,
      userId: candidateData.user_id,
      status: error.response?.status,
    });
    throw new Error(`Checkr candidate creation failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Create a background check report
 * @param {string} candidateId - Checkr candidate ID
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Checkr report object
 */
const createReport = async (candidateId, options = {}) => {
  try {
    logger.info('Creating Checkr report', { candidateId });

    const reportData = {
      candidate_id: candidateId,
      package: options.package || 'standard',
      ...options.additionalChecks,
    };

    const response = await checkrClient.post('/reports', reportData);

    logger.info('Checkr report created', { 
      reportId: response.data.id,
      candidateId,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to create Checkr report', {
      error: error.message,
      candidateId,
      status: error.response?.status,
    });
    throw new Error(`Checkr report creation failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get report status and results
 * @param {string} reportId - Checkr report ID
 * @returns {Promise<Object>} Report details
 */
const getReport = async (reportId) => {
  try {
    logger.info('Fetching Checkr report', { reportId });

    const response = await checkrClient.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch Checkr report', {
      error: error.message,
      reportId,
      status: error.response?.status,
    });
    throw new Error(`Checkr report fetch failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get candidate details
 * @param {string} candidateId - Checkr candidate ID
 * @returns {Promise<Object>} Candidate details
 */
const getCandidate = async (candidateId) => {
  try {
    const response = await checkrClient.get(`/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch Checkr candidate', {
      error: error.message,
      candidateId,
    });
    throw new Error(`Checkr candidate fetch failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Update background check in database
 * @param {string} userId - HugBack user ID
 * @param {Object} checkData - Background check data
 * @returns {Promise<Object>} Updated background check
 */
const updateBackgroundCheckInDb = async (userId, checkData) => {
  try {
    const { data, error } = await supabase
      .from('background_checks')
      .update(checkData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to update background check in database', {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Store Checkr webhook event and process it
 * @param {Object} webhookData - Webhook payload from Checkr
 * @returns {Promise<void>}
 */
const processWebhookEvent = async (webhookData) => {
  try {
    logger.info('Processing Checkr webhook', { 
      type: webhookData.type,
      reportId: webhookData.data?.id,
    });

    const { type, data } = webhookData;

    switch (type) {
      case 'report.completed':
        await handleReportCompleted(data);
        break;
      case 'report.updated':
        await handleReportUpdated(data);
        break;
      case 'report.suspended':
        await handleReportSuspended(data);
        break;
      case 'candidate.created':
        logger.info('Candidate created webhook received', { candidateId: data.id });
        break;
      default:
        logger.warn('Unknown webhook type', { type });
    }
  } catch (error) {
    logger.error('Failed to process webhook', {
      error: error.message,
      webhookType: webhookData.type,
    });
    throw error;
  }
};

/**
 * Handle report completion webhook
 */
const handleReportCompleted = async (reportData) => {
  try {
    // Find background check by checkr_report_id
    const { data: bgCheck, error: fetchError } = await supabase
      .from('background_checks')
      .select()
      .eq('checkr_report_id', reportData.id)
      .single();

    if (fetchError) throw fetchError;
    if (!bgCheck) {
      logger.warn('Background check not found for report', { reportId: reportData.id });
      return;
    }

    // Update status
    const status = reportData.status === 'clear' ? 'clear' : 'completed';
    
    const { error: updateError } = await supabase
      .from('background_checks')
      .update({
        status,
        report_status: reportData.status,
        completion_date: new Date().toISOString(),
        metadata: reportData,
      })
      .eq('id', bgCheck.id);

    if (updateError) throw updateError;

    // Update user profile
    if (reportData.status === 'clear') {
      await supabase
        .from('profiles')
        .update({
          background_check_verified: true,
          background_check_verified_date: new Date().toISOString(),
        })
        .eq('id', bgCheck.user_id);
    }

    // Log audit event
    await logAuditEvent(bgCheck.id, 'Report completed', null);

    logger.info('Background check completed', {
      backgroundCheckId: bgCheck.id,
      status,
      reportStatus: reportData.status,
    });
  } catch (error) {
    logger.error('Failed to handle report completion', {
      error: error.message,
      reportId: reportData.id,
    });
    throw error;
  }
};

/**
 * Handle report update webhook
 */
const handleReportUpdated = async (reportData) => {
  try {
    const { data: bgCheck, error: fetchError } = await supabase
      .from('background_checks')
      .select()
      .eq('checkr_report_id', reportData.id)
      .single();

    if (fetchError || !bgCheck) {
      logger.warn('Background check not found for report update', { reportId: reportData.id });
      return;
    }

    await supabase
      .from('background_checks')
      .update({
        metadata: reportData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bgCheck.id);

    await logAuditEvent(bgCheck.id, 'Report updated', null);
  } catch (error) {
    logger.error('Failed to handle report update', {
      error: error.message,
      reportId: reportData.id,
    });
  }
};

/**
 * Handle report suspension webhook
 */
const handleReportSuspended = async (reportData) => {
  try {
    const { data: bgCheck, error: fetchError } = await supabase
      .from('background_checks')
      .select()
      .eq('checkr_report_id', reportData.id)
      .single();

    if (fetchError || !bgCheck) {
      logger.warn('Background check not found for suspension', { reportId: reportData.id });
      return;
    }

    await supabase
      .from('background_checks')
      .update({
        status: 'suspended',
        metadata: reportData,
      })
      .eq('id', bgCheck.id);

    await logAuditEvent(bgCheck.id, 'Report suspended', null);

    logger.info('Background check suspended', { backgroundCheckId: bgCheck.id });
  } catch (error) {
    logger.error('Failed to handle report suspension', {
      error: error.message,
      reportId: reportData.id,
    });
  }
};

/**
 * Log audit event for compliance
 */
const logAuditEvent = async (backgroundCheckId, action, actorId, req = null) => {
  try {
    await supabase
      .from('background_check_audit_logs')
      .insert({
        background_check_id: backgroundCheckId,
        action,
        actor_id: actorId,
        ip_address: req?.ip || null,
        user_agent: req?.get('user-agent') || null,
      });
  } catch (error) {
    logger.error('Failed to log audit event', {
      error: error.message,
      backgroundCheckId,
    });
  }
};

/**
 * Initiate background check for a user
 */
const initiateBackgroundCheck = async (userId, candidateData) => {
  try {
    logger.info('Initiating background check', { userId });

    // Create Checkr candidate
    const candidate = await createCandidate({
      ...candidateData,
      user_id: userId,
    });

    // Create database record
    const { data: bgCheck, error: createError } = await supabase
      .from('background_checks')
      .insert({
        user_id: userId,
