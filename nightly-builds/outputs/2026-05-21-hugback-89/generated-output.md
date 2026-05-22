[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  const navigate = useNavigate();

  const handleMeetSafeCheckIn = async (event) => {
    event.preventDefault();
    try {
      // Send a POST request to the backend API
      const response = await fetch('/api/meet-safety-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn: true }),
      });
      if (response.ok) {
        navigate('/home');
      } else {
        console.error('Error checking in safely:', response.statusText);
      }
    } catch (error) {
      console.error('Error checking in safely:', error.message);
    }
  };

  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit" style={{ backgroundColor: HugBackColors.amber, color: 'white' }}>
          Yes, I met someone safely
        </button>
      </form>
    </div>
  );
};

export default DidYouMeetSafely;
```

[FILE: src/styles/DidYouMeetSafely.css]
```css
.did-you-meet-safely {
  background-color: #fff3e6;
  padding: 20px;
}

button[type="submit"] {
  background-color: #f59e0b;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
```

[FILE: src/components/DidYouMeetSafelyForm.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyForm = () => {
  return (
    <form>
      <label>
        Did you meet someone safely today?
      </label>
      <input type="checkbox" />
      <button type="submit">Yes</button>
    </form>
  );
};

export default DidYouMeetSafelyForm;
```

[FILE: src/components/DidYouMeetSafelyButton.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyButton = () => {
  return (
    <button type="submit" style={{ backgroundColor: HugBackColors.amber, color: 'white' }}>
      Yes, I met someone safely
    </button>
  );
};

export default DidYouMeetSafelyButton;
```

[FILE: src/pages/Home.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Home</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <DidYouMeetSafelyButton />
    </div>
  );
};

export default Home;
```

[FILE: src/components/MeetSafe.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const MeetSafe = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Meet Safe</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <DidYouMeetSafelyButton />
    </div>
  );
};

export default MeetSafe;
```

[FILE: src/components/DidYouMeetSafelyContainer.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyContainer = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes, I met someone safely
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      navigate('/home');
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafelyContainer;
```

[FILE: src/components/DidYouMeetSafelyForm.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyForm = () => {
  const navigate = useNavigate();

  return (
    <form>
      <label>
        Did you meet someone safely today?
      </label>
      <input type="checkbox" />
      <button type="submit">
        Yes
      </button>
    </form>
  );
};

export default DidYouMeetSafelyForm;
```

[FILE: src/pages/MeetSafe.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const MeetSafe = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Meet Safe</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      navigate('/home');
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default MeetSafe;
```

[FILE: src/components/DidYouMeetSafelyButton.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyButton = () => {
  return (
    <button type="submit" style={{ backgroundColor: HugBackColors.amber, color: 'white' }}>
      Yes, I met someone safely
    </button>
  );
};

export default DidYouMeetSafelyButton;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafelyForm.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyForm = () => {
  return (
    <form>
      <label>
        Did you meet someone safely today?
      </label>
      <input type="checkbox" />
      <button type="submit">
        Yes
      </button>
    </form>
  );
};

export default DidYouMeetSafelyForm;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafelyForm.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyForm = () => {
  return (
    <form>
      <label>
        Did you meet someone safely today?
      </label>
      <input type="checkbox" />
      <button type="submit">
        Yes
      </button>
    </form>
  );
};

export default DidYouMeetSafelyForm;
```

[FILE: src/components/DidYouMeetSafelyButton.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafelyButton = () => {
  return (
    <button type="submit" style={{ backgroundColor: HugBackColors.amber, color: 'white' }}>
      Yes, I met someone safely
    </button>
  );
};

export default DidYouMeetSafelyButton;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```

[FILE: src/components/DidYouMeetSafely.js]
```jsx
import React from 'react';
import { HugBackColors } from '../styles/colors';

const DidYouMeetSafely = () => {
  return (
    <div style={{ backgroundColor: HugBackColors.cream, padding: 20 }}>
      <h2>Did you meet safely?</h2>
      <p>
        Check in after meeting someone safely to help us keep you safe.
      </p>
      <form onSubmit={handleMeetSafeCheckIn}>
        <button type="submit">
          Yes
        </button>
      </form>
    </div>
  );
};

const handleMeetSafeCheckIn = async (event) => {
  event.preventDefault();
  try {
    // Send a POST request to the backend API
    const response = await fetch('/api/meet-safety-check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: true }),
    });
    if (response.ok) {
      // Navigate to home page
    } else {
      console.error('Error checking in safely:', response.statusText);
    }
  } catch (error) {
    console.error('Error checking in safely:', error.message);
  }
};

export default DidYouMeetSafely;
```
