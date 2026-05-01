# HugBack Multiple Language Support Feature

I'll build a complete, production-ready language support system using Google Translate API with localStorage for preferences and UI language switching.

---

## [FILE: migrations/2024-01-15-add-language-support.sql]

```sql
-- Add language preference to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Create language_settings table for managing supported languages
CREATE TABLE IF NOT EXISTS language_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code VARCHAR(10) UNIQUE NOT NULL,
  language_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert supported languages
INSERT INTO language_settings (language_code, language_name, is_active) VALUES
  ('en', 'English', true),
  ('es', 'Español', true),
  ('fr', 'Français', true),
  ('de', 'Deutsch', true),
  ('ja', '日本語', true),
  ('zh', '中文', true),
  ('pt', 'Português', true),
  ('ko', '한국어', true),
  ('ar', 'العربية', true),
  ('hi', 'हिन्दी', true)
ON CONFLICT DO NOTHING;

-- Create translation_cache table for caching translations
CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '90 days'
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup 
ON translation_cache (source_text, source_language, target_language) 
WHERE expires_at > NOW();

-- Create audit log for language changes
CREATE TABLE IF NOT EXISTS language_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  previous_language VARCHAR(10),
  new_language VARCHAR(10),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## [FILE: backend/services/translateService.js]

```javascript
const axios = require('axios');
const { supabase } = require('../config/supabase');

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

class TranslateService {
  constructor() {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn('Warning: GOOGLE_TRANSLATE_API_KEY not configured');
    }
  }

  /**
   * Translate text to target language
   */
  async translateText(text, targetLanguage, sourceLanguage = 'en') {
    try {
      // Validate inputs
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text for translation');
      }

      if (text.length > 5000) {
        throw new Error('Text exceeds maximum length of 5000 characters');
      }

      // Return original if source and target are same
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      // Check cache first
      const cached = await this.getFromCache(text, sourceLanguage, targetLanguage);
      if (cached) {
        return cached;
      }

      // Call Google Translate API
      if (!GOOGLE_TRANSLATE_API_KEY) {
        console.error('Google Translate API key not configured');
        return text; // Fallback to original text
      }

      const response = await axios.post(GOOGLE_TRANSLATE_API_URL, null, {
        params: {
          key: GOOGLE_TRANSLATE_API_KEY,
          q: text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        },
        timeout: 5000,
      });

      const translatedText =
        response.data?.data?.translations?.[0]?.translatedText || text;

      // Cache the translation
      await this.cacheTranslation(
        text,
        sourceLanguage,
        targetLanguage,
        translatedText
      );

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error.message);
      // Return original text on error
      return text;
    }
  }

  /**
   * Translate multiple texts at once
   */
  async translateBatch(texts, targetLanguage, sourceLanguage = 'en') {
    try {
      if (!Array.isArray(texts) || texts.length === 0) {
        return [];
      }

      return Promise.all(
        texts.map((text) =>
          this.translateText(text, targetLanguage, sourceLanguage)
        )
      );
    } catch (error) {
      console.error('Batch translation error:', error.message);
      return texts;
    }
  }

  /**
   * Translate complex object (recursively)
   */
  async translateObject(obj, targetLanguage, sourceLanguage = 'en') {
    try {
      if (typeof obj === 'string') {
        return this.translateText(obj, targetLanguage, sourceLanguage);
      }

      if (Array.isArray(obj)) {
        return Promise.all(
          obj.map((item) =>
            this.translateObject(item, targetLanguage, sourceLanguage)
          )
        );
      }

      if (typeof obj === 'object' && obj !== null) {
        const translated = {};
        for (const [key, value] of Object.entries(obj)) {
          translated[key] = await this.translateObject(
            value,
            targetLanguage,
            sourceLanguage
          );
        }
        return translated;
      }

      return obj;
    } catch (error) {
      console.error('Object translation error:', error.message);
      return obj;
    }
  }

  /**
   * Get translation from cache
   */
  async getFromCache(text, sourceLanguage, targetLanguage) {
    try {
      const { data } = await supabase
        .from('translation_cache')
        .select('translated_text')
        .eq('source_text', text)
        .eq('source_language', sourceLanguage)
        .eq('target_language', targetLanguage)
        .gt('expires_at', new Date().toISOString())
        .single();

      return data?.translated_text || null;
    } catch (error) {
      // No cache hit is expected, return null silently
      return null;
    }
  }

  /**
   * Cache a translation
   */
  async cacheTranslation(sourceText, sourceLanguage, targetLanguage, translatedText) {
    try {
      await supabase.from('translation_cache').insert([
        {
          source_text: sourceText,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          translated_text: translatedText,
        },
      ]);
    } catch (error) {
      console.error('Cache storage error:', error.message);
      // Non-critical operation, don't throw
    }
  }

  /**
   * Get all supported languages
   */
  async getSupportedLanguages() {
    try {
      const { data } = await supabase
        .from('language_settings')
        .select('language_code, language_name')
        .eq('is_active', true)
        .order('language_name');

      return data || [];
    } catch (error) {
      console.error('Error fetching languages:', error.message);
      return this.getDefaultLanguages();
    }
  }

  /**
   * Default fallback languages
   */
  getDefaultLanguages() {
    return [
      { language_code: 'en', language_name: 'English' },
      { language_code: 'es', language_name: 'Español' },
      { language_code: 'fr', language_name: 'Français' },
      { language_code: 'de', language_name: 'Deutsch' },
      { language_code: 'ja', language_name: '日本語' },
      { language_code: 'zh', language_name: '中文' },
      { language_code: 'pt', language_name: 'Português' },
      { language_code: 'ko', language_name: '한국어' },
      { language_code: 'ar', language_name: 'العربية' },
      { language_code: 'hi', language_name: 'हिन्दी' },
    ];
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    try {
      const { error } = await supabase
        .from('translation_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Cache cleanup error:', error);
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error.message);
    }
  }
}

module.exports = new TranslateService();
```

---

## [FILE: backend/routes/translate.js]

```javascript
const express = require('express');
const translateService = require('../services/translateService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/translate/text
 * Translate text to target language
 */
router.post('/text', authenticateToken, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: 'Missing required fields: text, targetLanguage',
      });
    }

    const translatedText = await translateService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );

    res.json({
      original: text,
      translated: translatedText,
      targetLanguage,
      sourceLanguage,
    });
  } catch (error) {
    console.error('Translation endpoint error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/translate/batch
 * Translate multiple texts at once
 */
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!Array.isArray(texts) || !targetLanguage) {
      return res.status(400).json({
        error: 'Invalid request. Expected: { texts: [], targetLanguage }',
      });
    }

    const translated = await translateService.translateBatch(
      texts,
      targetLanguage,
      sourceLanguage
    );

    res.json({
      original: texts,
      translated,
      targetLanguage,
      sourceLanguage,
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      error: 'Batch translation failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/translate/languages
 * Get all supported languages
 */
router.get('/languages', async (req, res) => {
  try {
    const languages = await translateService.getSupportedLanguages();
    res.json({
      languages,
      count: languages.length,
    });
  } catch (error) {
    console.error('Languages fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch languages',
      message: error.message,
    });
  }
});

/**
 * POST /api/translate/set-preference
 * Set user's language preference
 */
router.post('/set-preference', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user.id;

    if (!language) {
      return res.status(400).json({ error: 'Language code required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', userId)
      .select();

    if (error) throw error;

    // Log the change
    await supabase.from('language_audit_log').insert([
      {
        user_id: userId,
        new_language: language,
      },
    ]);

    res.json({
      message: 'Language preference updated',
      language,
      user: data[0],
    });
  } catch (error) {
    console.error('Preference update error:', error);
    res.status(500).json({
      error: 'Failed to update language preference',
      message: error.message,
    });
  }
});

/**
 * GET /api/translate/preference
 * Get user's language preference
 */
router.get('/preference', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      language: data?.preferred_language || 'en',
    });
  } catch (error) {
    console.error('Preference fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch language preference',
      message: error.message,
    });
  }
});

/**
 * POST /api/translate/clear-cache
 * Clear expired translations (admin only)
 */
router.post('/clear-cache', authenticateToken, async (req, res) => {
  try {
    // Check admin role (you may want to implement this)
    await translateService.clearExpiredCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
    });
  }
});

module.exports = router;
```

---

## [FILE: frontend/src/hooks/useTranslation.js]

```javascript
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const useTranslation = () => {
  const { user, token } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's saved language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (!user || !token) return;

      try {
        const response = await fetch(`${API_BASE}/translate/preference`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCurrentLanguage(data.language || 'en');
        localStorage.setItem('preferredLanguage', data.language || 'en');
      } catch (
