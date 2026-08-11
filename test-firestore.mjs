import https from 'https';

const projectId = 'glintspark-502909';
const trackId = 'c';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/curriculum_tracks/${trackId}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(data);
  });
}).on('error', err => {
  console.error("Error:", err.message);
});
