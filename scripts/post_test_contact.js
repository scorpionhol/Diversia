(async () => {
  const fetch = global.fetch || (() => { throw new Error('global.fetch not available') });
  try {
    const postRes = await fetch('http://localhost:4000/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Ceci est une demande urgente de test',
        subject: 'Sujet test',
        urgency: 'urgent'
      })
    });
    console.log('POST /api/contacts status:', postRes.status);
    console.log(await postRes.text());

    const getRes = await fetch('http://localhost:4000/api/requests', {
      method: 'GET',
      headers: { Authorization: 'Bearer fake-jwt-token' }
    });
    console.log('\nGET /api/requests status:', getRes.status);
    console.log(await getRes.text());
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  }
})();
