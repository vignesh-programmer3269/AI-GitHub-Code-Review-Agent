import 'dotenv/config';
import axios from 'axios';
import { buildPlanningContext } from './src/context/builders/planningContextBuilder.js';
import { buildPlanningPrompt } from './src/prompts/planningPromptBuilder.js';

// Dummy context
const dummyContext = {
  repo: "User-Management-Dashboard",
  owner: "vignesh-programmer3269",
  metadata: { languages: [], sizeKb: 100 },
  fileTree: [{ path: "src/index.js", type: "blob" }],
  fileContents: [{ path: "src/index.js", content: "console.log('hi')" }]
};

(async () => {
  try {
    const planningContext = buildPlanningContext(dummyContext);
    const prompts = buildPlanningPrompt(planningContext);
    const combinedPrompt = `${prompts.systemPrompt}\n\nEXPECTED JSON SCHEMA:\n${JSON.stringify(prompts.expectedSchema, null, 2)}\n\n${prompts.userPrompt}`;

    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      messages: [{ role: 'user', content: combinedPrompt }]
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    
    console.log(res.data.choices[0].message.content);
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
})();
