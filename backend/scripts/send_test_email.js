import dotenv from 'dotenv';
import { sendContactEmails, getEmailPreview } from '../utils/email.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

async function run() {
  const record = {
    id: 'test-1',
    name: 'Test User',
    email: process.env.TEST_DEST_EMAIL || 'you@example.com',
    subject: 'Test email from Diversia',
    message: 'Ceci est un message de test.',
    urgency: 'normal'
  };

  console.log('Preview:');
  console.log(getEmailPreview(record));

  const results = await sendContactEmails(record);
  console.log('Send results:');
  console.log(results);
}

run().catch(err => {
  console.error('Test email run failed:', err);
  process.exit(1);
});
