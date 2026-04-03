Here’s a complete implementation of an email triage system for Ben called "Chaos Destroyer." This system is designed to auto-categorize emails into important versus noise and flag urgent items. The implementation includes a Python script, a README file, and necessary error handling and logging.

### Implementation Files

#### 1. Email Triage Script

```
[FILE: /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-03-28-chaos-destroyer-34/email_triage.py]
```python
import imaplib
import email
from email.header import decode_header
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, filename='email_triage.log', filemode='a',
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Email configuration
EMAIL = 'your_email@example.com'
PASSWORD = 'your_password'
IMAP_SERVER = 'imap.example.com'

# Define categories
IMPORTANT_KEYWORDS = ['urgent', 'important', 'asap', 'action required']
NOISE_KEYWORDS = ['newsletter', 'promo', 'spam', 'offers']

def clean_subject(subject):
    # Decode email subject
    decoded = decode_header(subject)
    subject = ''.join([str(t[0], t[1] if t[1] else 'utf-8') if isinstance(t[0], bytes) else t[0] for t in decoded])
    return subject

def is_urgent(subject):
    return any(keyword in subject.lower() for keyword in IMPORTANT_KEYWORDS)

def is_noise(subject):
    return any(keyword in subject.lower() for keyword in NOISE_KEYWORDS)

def categorize_email(subject):
    if is_urgent(subject):
        return 'Urgent'
    elif is_noise(subject):
        return 'Noise'
    else:
        return 'Important'

def main():
    try:
        # Connect to the email server
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL, PASSWORD)
        mail.select('inbox')

        # Search for all emails
        status, messages = mail.search(None, 'ALL')

        # Get email IDs
        email_ids = messages[0].split()

        categorized_emails = {'Urgent': [], 'Noise': [], 'Important': []}

        for email_id in email_ids:
            res, msg = mail.fetch(email_id, '(RFC822)')
            msg = email.message_from_bytes(msg[0][1])
            subject = clean_subject(msg['subject'])
            category = categorize_email(subject)

            categorized_emails[category].append(subject)
            logging.info(f'Categorized email: {subject} -> {category}')

        mail.logout()

        # Output categorized emails
        with open('categorized_emails.txt', 'w') as f:
            for category, subjects in categorized_emails.items():
                f.write(f'{category}:\n')
                for subject in subjects:
                    f.write(f'  - {subject}\n')

        logging.info('Email triage completed successfully.')

    except Exception as e:
        logging.error(f'Error during email triage: {str(e)}')

if __name__ == '__main__':
    main()
```

#### 2. README File

```
[FILE: /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-03-28-chaos-destroyer-34/README.md]
```
# Chaos Destroyer - Email Triage System

## What I Built
This is an email triage system that connects to your email account, fetches emails, and categorizes them into three groups: Urgent, Important, and Noise. It flags emails based on predefined keywords.

## How to Use It
1. Set your email credentials and IMAP server in the `email_triage.py` script.
2. Run the script to categorize your inbox emails.
3. Check the `categorized_emails.txt` file for the output of categorized emails.

## Integration Steps
1. **Email Configuration**: Update the `EMAIL`, `PASSWORD`, and `IMAP_SERVER` variables in the script with your credentials.
2. **Run the Script**: Execute the script using Python 3:
   ```bash
   python3 email_triage.py
   ```
3. **Check Output**: The categorized emails will be saved in `categorized_emails.txt`.

## Required Setup
- Python 3
- `imaplib` and `email` modules (included with Python standard library)

## Example of Categorization
- **Urgent**: "Action Required: Please Review"
- **Noise**: "Weekly Newsletter - Special Offers"
- **Important**: "Team Meeting Agenda"

## Logging
All actions are logged in `email_triage.log`.

## Error Handling
The script includes error handling for connection issues and logs errors to `email_triage.log`.

## Sample Data
The output file `categorized_emails.txt` will contain categorized emails after running the script.

---

This setup provides Ben with a practical tool to manage his email efficiently, reducing noise and highlighting urgent communications effectively.
