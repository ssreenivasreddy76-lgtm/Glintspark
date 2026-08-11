import https from 'https';

const projectId = 'glintspark-502909';
const trackId = 'c';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/curriculum_tracks/${trackId}`;

const payload = {
  fields: {
    test: { stringValue: 'hello' }
  }
};

const req = https.request(url, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(data);
  });
});

req.on('error', err => console.error(err));
req.write(JSON.stringify(payload));
req.end();
