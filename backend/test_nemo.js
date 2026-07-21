import 'dotenv/config';
import axios from 'axios';

(async () => {
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      messages: [
        { role: 'user', content: 'You must respond EXCLUSIVELY in valid JSON. Output a JSON object with keys name, age. Do not include markdown formatting or extra text.\n\nEXPECTED JSON SCHEMA:\n' + JSON.stringify({ type: "object", properties: { name: {type: "string"}, age: {type: "number"} }, required: ["name", "age"] }, null, 2) }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
})();
