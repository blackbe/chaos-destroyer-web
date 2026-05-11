[FILE: src/components/LanguageSelector.js]
```jsx
import React from 'react';

const LanguageSelector = () => {
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
  ];

  return (
    <select className="language-selector">
      {languages.map((language) => (
        <option key={language.value} value={language.value}>
          {language.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
```

[FILE: src/styles/LanguageSelector.css]
```css
.language-selector {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  background-color: #fff3e6;
  border: 1px solid #f59e0b;
}

.language-selector option {
  color: #333;
  font-size: 14px;
}
```

[FILE: src/components/LoginForm.js]
```jsx
import React from 'react';
import LanguageSelector from './LanguageSelector';

const LoginForm = () => {
  return (
    <form className="login-form">
      <h2>Login</h2>
      <LanguageSelector />
      {/* Rest of the login form */}
    </form>
  );
};

export default LoginForm;
```

[FILE: src/styles/LoginForm.css]
```css
.login-form {
  max-width: 300px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff3e6;
  border: 1px solid #f59e0b;
}

.login-form h2 {
  color: #333;
}
```

[FILE: backend/routes/auth.js]
```javascript
const express = require('express');
const router = express.Router();

router.get('/language-selector', (req, res) => {
  // Static strings for language selector
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
  ];

  res.render('language-selector', { languages });
});

module.exports = router;
```

[FILE: src/pages/Home.js]
```jsx
import React from 'react';
import LanguageSelector from '../components/LanguageSelector';

const Home = () => {
  return (
    <div>
      <h1>Welcome to HugBack</h1>
      <LanguageSelector />
      {/* Rest of the home page */}
    </div>
  );
};

export default Home;
```

[FILE: src/components/StoryWall.js]
```jsx
import React from 'react';

const StoryWall = () => {
  return (
    <div className="story-wall">
      {/* Story content goes here */}
    </div>
  );
};

export default StoryWall;
```

[FILE: backend/migrations/2023-12-15-add-language-selector.sql]
```sql
CREATE TABLE language_selector_options (
  id SERIAL PRIMARY KEY,
  value VARCHAR(10) NOT NULL,
  label VARCHAR(255) NOT NULL
);

INSERT INTO language_selector_options (value, label)
VALUES ('en', 'English'),
       ('fr', 'French'),
       ('es', 'Spanish');
```

[FILE: src/components/StoryWall.css]
```css
.story-wall {
  width: 100%;
  padding: 20px;
  background-color: #fff3e6;
  border: 1px solid #f59e0b;
}

.story-wall h2 {
  color: #333;
}
```

SCREENSHOTS.md

* [Code snippet for LanguageSelector component]
* [Code snippet for LoginForm component]
* [Code snippet for Home page with LanguageSelector]

README.md
# HugBack - Mental Wellness and Peer Support App

## Feature #54: Language Selector Dropdown

This feature adds a language selector dropdown to the login form and home page. The dropdown contains three options: English, French, and Spanish.

### Testing

To test this feature, navigate to `localhost:3000` in your browser and log in with an existing account. You should see a dropdown menu for selecting the language.

### Integration Steps

1. Add the LanguageSelector component to App.js
2. Import the LanguageSelector component in Login.js and Home.js
3. Update the database schema by running `./migrations/2023-12-15-add-language-selector.sql`

Note: This feature does not include any API translation, as per the requirements. The language selector dropdown only contains static strings for English, French, and Spanish.
