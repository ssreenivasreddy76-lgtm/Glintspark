import https from 'https';

class MockFirebaseService {
  _fromFirestoreREST(obj) {
    if (!obj) return null;
    if ('nullValue' in obj) return null;
    if ('booleanValue' in obj) return obj.booleanValue;
    if ('integerValue' in obj) return Number(obj.integerValue);
    if ('doubleValue' in obj) return Number(obj.doubleValue);
    if ('stringValue' in obj) return obj.stringValue;
    if ('arrayValue' in obj) return (obj.arrayValue.values || []).map(v => this._fromFirestoreREST(v));
    if ('mapValue' in obj) {
      const result = {};
      const fields = obj.mapValue.fields || {};
      for (const [k, v] of Object.entries(fields)) {
        result[k] = this._fromFirestoreREST(v);
      }
      return result;
    }
    return null;
  }
}

const service = new MockFirebaseService();

const projectId = 'glintspark-502909';
const trackId = 'c';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/curriculum_tracks/${trackId}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    const parsed = service._fromFirestoreREST({ mapValue: { fields: json.fields } });
    console.log("Parsed Modules Length:", parsed.modules.length);
    console.log("First Module ID:", parsed.modules[0].id);
    console.log("First Module Lessons Length:", parsed.modules[0].lessons.length);
    if (parsed.modules[0].lessons.length > 0) {
      console.log("First Lesson ID:", parsed.modules[0].lessons[0].id);
      console.log("First Lesson Title:", parsed.modules[0].lessons[0].title);
    }
  });
});
