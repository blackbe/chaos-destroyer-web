# HugBack Safety Check-ins Feature (#58)

I'll build a custom safety check-in system that allows users to set up recurring wellness check-ins with trusted contacts or mentors.

---

## [FILE: migrations/2024-01-15-safety-checkins.sql]

```sql
-- Create safety_checkins table
CREATE TABLE safety_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  preferred_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  last_checkin_at TIMESTAMP,
  next_checkin_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create checkin_responses table
CREATE TABLE checkin_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES safety_checkins(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'responding', 'completed', 'missed')),
  response_text TEXT,
  wellness_score INT CHECK (wellness_score >= 1 AND wellness_score <= 10),
  mood_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  needs_support BOOLEAN DEFAULT FALSE,
  support_reason TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create checkin_notes table (for user notes during check-in)
CREATE TABLE checkin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_response_id UUID NOT NULL REFERENCES checkin_responses(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_safety_checkins_user_id ON safety_checkins(user_id);
CREATE INDEX idx_safety_checkins_contact_id ON safety_checkins(contact_id);
CREATE INDEX idx_safety_checkins_next_checkin ON safety_checkins(next_checkin_at);
CREATE INDEX idx_checkin_responses_checkin_id ON checkin_responses(checkin_id);
CREATE INDEX idx_checkin_responses_responder_id ON checkin_responses(responder_id);
CREATE INDEX idx_checkin_responses_status ON checkin_responses(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_safety_checkins_updated_at
BEFORE UPDATE ON safety_checkins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkin_responses_updated_at
BEFORE UPDATE ON checkin_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE safety_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for safety_checkins
CREATE POLICY "Users can view their own check-ins"
  ON safety_checkins FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = contact_id);

CREATE POLICY "Users can create check-ins"
  ON safety_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON safety_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
  ON safety_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for checkin_responses
CREATE POLICY "Users can view responses to their check-ins"
  ON checkin_responses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM safety_checkins WHERE id = checkin_id
    ) OR auth.uid() = responder_id
  );

CREATE POLICY "Users can create responses"
  ON checkin_responses FOR INSERT
  WITH CHECK (auth.uid() = responder_id);

CREATE POLICY "Users can update their own responses"
  ON checkin_responses FOR UPDATE
  USING (auth.uid() = responder_id);

-- RLS Policies for checkin_notes
CREATE POLICY "Users can view notes on their responses"
  ON checkin_notes FOR SELECT
  USING (
    auth.uid() IN (
      SELECT responder_id FROM checkin_responses WHERE id = checkin_response_id
    )
  );

CREATE POLICY "Users can create notes on their responses"
  ON checkin_notes FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT responder_id FROM checkin_responses WHERE id = checkin_response_id
    )
  );
```

---

## [FILE: backend/routes/checkins.js]

```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET all check-ins for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('safety_checkins')
      .select(`
        *,
        contact:contact_id(id, email, user_metadata)
      `)
      .or(`user_id.eq.${userId},contact_id.eq.${userId}`)
      .order('next_checkin_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single check-in with responses
router.get('/:checkinId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { checkinId } = req.params;

    const { data: checkin, error: checkinError } = await supabase
      .from('safety_checkins')
      .select('*')
      .eq('id', checkinId)
      .single();

    if (checkinError) throw checkinError;

    // Verify user has access
    if (
      checkin.user_id !== userId &&
      checkin.contact_id !== userId
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from('checkin_responses')
      .select(`
        *,
        notes:checkin_notes(*)
      `)
      .eq('checkin_id', checkinId)
      .order('created_at', { ascending: false });

    if (responsesError) throw responsesError;

    res.json({ ...checkin, responses });
  } catch (error) {
    console.error('Error fetching check-in:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE new check-in
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactId, frequency, preferredTime, timezone, notes } = req.body;

    // Validate required fields
    if (!contactId || !frequency || !preferredTime || !timezone) {
      return res.status(400).json({
        error: 'Missing required fields: contactId, frequency, preferredTime, timezone',
      });
    }

    // Validate frequency
    if (!['daily', 'weekly', 'biweekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ error: 'Invalid frequency' });
    }

    // Calculate next check-in time
    const nextCheckinAt = calculateNextCheckin(frequency, preferredTime);

    const { data, error } = await supabase
      .from('safety_checkins')
      .insert([
        {
          user_id: userId,
          contact_id: contactId,
          frequency,
          preferred_time: preferredTime,
          timezone,
          notes,
          next_checkin_at: nextCheckinAt,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating check-in:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE check-in
router.patch('/:checkinId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { checkinId } = req.params;
    const { frequency, preferredTime, timezone, status, notes } = req.body;

    // Verify ownership
    const { data: checkin, error: checkinError } = await supabase
      .from('safety_checkins')
      .select('user_id')
      .eq('id', checkinId)
      .single();

    if (checkinError) throw checkinError;
    if (checkin.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {};
    if (frequency) updateData.frequency = frequency;
    if (preferredTime) updateData.preferred_time = preferredTime;
    if (timezone) updateData.timezone = timezone;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate next check-in if frequency or time changed
    if (frequency || preferredTime) {
      const newFrequency = frequency || checkin.frequency;
      const newTime = preferredTime || checkin.preferred_time;
      updateData.next_checkin_at = calculateNextCheckin(newFrequency, newTime);
    }

    const { data, error } = await supabase
      .from('safety_checkins')
      .update(updateData)
      .eq('id', checkinId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating check-in:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE check-in
router.delete('/:checkinId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { checkinId } = req.params;

    // Verify ownership
    const { data: checkin, error: checkinError } = await supabase
      .from('safety_checkins')
      .select('user_id')
      .eq('id', checkinId)
      .single();

    if (checkinError) throw checkinError;
    if (checkin.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('safety_checkins')
      .delete()
      .eq('id', checkinId);

    if (error) throw error;
    res.json({ message: 'Check-in deleted' });
  } catch (error) {
    console.error('Error deleting check-in:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE check-in response
router.post('/:checkinId/responses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { checkinId } = req.params;
    const { status, responseText, wellnessScore, moodTags, needsSupport, supportReason } = req.body;

    // Verify user is the contact for this check-in
    const { data: checkin, error: checkinError } = await supabase
      .from('safety_checkins')
      .select('contact_id, user_id')
      .eq('id', checkinId)
      .single();

    if (checkinError) throw checkinError;
    if (checkin.contact_id !== userId) {
      return res.status(403).json({ error: 'Only contact can respond' });
    }

    const { data, error } = await supabase
      .from('checkin_responses')
      .insert([
        {
          checkin_id: checkinId,
          responder_id: userId,
          status: status || 'completed',
          response_text: responseText,
          wellness_score: wellnessScore,
          mood_tags: moodTags || [],
          needs_support: needsSupport || false,
          support_reason: supportReason,
          responded_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update last_checkin_at on safety_checkins
    await supabase
      .from('safety_checkins')
      .update({
        last_checkin_at: new Date().toISOString(),
        next_checkin_at: calculateNextCheckin(checkin.frequency, checkin.preferred_time),
      })
      .eq('id', checkinId);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating response:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADD note to response
router.post('/responses/:responseId/notes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { responseId } = req.params;
    const { noteText } = req.body;

    if (!noteText) {
      return res.status(400).json({ error: 'Note text required' });
    }

    // Verify user is responder
    const { data: response, error: responseError } = await supabase
      .from('checkin_responses')
      .select('responder_id')
      .eq('id', responseId)
      .single();

    if (responseError) throw responseError;
    if (response.responder_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('checkin_notes')
      .insert([
        {
          checkin_response_id: responseId,
          note_text: noteText,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET check-in history/stats
router.get('/:checkinId
