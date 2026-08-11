import https from 'https';

const projectId = 'glintspark-502909';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/challenges?pageSize=100`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Status: ${res.statusCode}`);
      const count = json.documents ? json.documents.length : 0;
      console.log(`Total challenges found: ${count}`);
    } catch (e) {
      console.error(e);
    }
  });
});
