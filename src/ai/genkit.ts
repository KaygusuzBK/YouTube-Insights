import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyB446sE3RuxjZb7iJHvz_QiY3ltVYB0ZQ8'})],
  model: 'googleai/gemini-2.0-flash',
});
