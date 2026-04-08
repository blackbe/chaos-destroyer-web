import { getExercises } from './lib/body-language-mastery-curriculum';
import express, { Request, Response } from 'express';

const app = express();

app.get('/exercises', (req: Request, res: Response) => {
  const exercises = getExercises(1);
  if (exercises) {
    return res.json(exercises);
  }
  return res.status(404).json({ message: 'Curriculum not found' });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});