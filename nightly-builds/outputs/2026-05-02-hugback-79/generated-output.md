I'll start by creating the Emergency Contact feature for users. Here's my implementation:

[FILE: src/components/EmergencyContact.js]
```jsx
import React, { useState } from 'react';
import { Button, TextField } from '@hugback/ui';
import colors from '~/styles/colors';

const EmergencyContact = () => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !number) {
      setError('Please fill in both fields');
      return;
    }
    // Send request to API to store emergency contact
    fetch('/api/emergency-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, number }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setError(null);
      })
      .catch((error) => {
        setError('Failed to store emergency contact');
      });
  };

  return (
    <div>
      <h2>Emergency Contact</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Number"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
        />
        {error && <p style={{ color: colors.error }}>{error}</p>}
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default EmergencyContact;
```

[FILE: src/components/EmergencyContact.css]
```css
/* Add CSS styles for Emergency Contact component */
```

[FILE: backend/routes/api.js]
```javascript
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_username',
  host: 'your_host',
  database: 'hugback',
  password: 'your_password',
  port: 5432,
});

const api = express.Router();

api.post('/emergency-contacts', async (req, res) => {
  try {
    const { name, number } = req.body;
    await pool.query(
      `INSERT INTO emergency_contacts (name, number) VALUES ($1, $2) RETURNING *`,
      [name, number],
    );
    return { message: 'Emergency contact stored successfully' };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to store emergency contact' };
  }
});

module.exports = api;
```

[FILE: migrations/2023-03-15-add-emergency-contact-table.sql]
```sql
-- Add table for storing emergency contacts
CREATE TABLE emergency_contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL
);
```

README.md:

**Emergency Contact Feature**

This feature allows users to store their emergency contact information. When a user submits their details, the API stores it in the `emergency_contacts` table.

To test this feature, navigate to `/emergency-contact` and fill in both fields. Clicking the "Save" button will send a POST request to the API to store the emergency contact.

**Integration Steps:**

1. Add the `EmergencyContact` component to your App.js file.
2. Import the `api` router from backend/routes/api.js.
3. Create a new route for `/emergency-contact`.

SCREENSHOTS.md:

* A screenshot of the Emergency Contact form in action
* A screenshot of the API response when a user submits their details

I've implemented a simple form component that allows users to input their emergency contact information. The data is sent to the API using a POST request, which stores it in the `emergency_contacts` table.

Please let me know if this meets your requirements or if I need to make any changes!
