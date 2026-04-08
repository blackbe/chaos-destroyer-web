interface Exercise {
  name: string;
  description: string;
  type: 'visual' | 'motor';
}

interface Curriculum {
  id: number;
  title: string;
  exercises: Exercise[];
}

const bodyLanguageMasteryCurriculum: Curriculum[] = [
  {
    id: 1,
    title: 'Introduction to Body Language',
    exercises: [
      {
        name: 'Smile and make eye contact',
        description: 'Practice smiling and maintaining eye contact with others.',
        type: 'visual',
      },
      {
        name: 'Use open and approachable body language',
        description: 'Stand up straight, uncross your arms, and face the person you are talking to.',
        type: 'motor',
      },
    ],
  },
  {
    id: 2,
    title: 'Reading Body Language Cues',
    exercises: [
      {
        name: 'Recognize relaxed and tense body language',
        description: 'Practice identifying relaxed and tense body language cues in others.',
        type: 'visual',
      },
      {
        name: 'Watch for micro-expressions',
        description: 'Study the facial expressions that reveal a person\'s true emotions.',
        type: 'motor',
      },
    ],
  },
];

export function getExercises(curriculumId: number): Exercise[] | null {
  const curriculum = bodyLanguageMasteryCurriculum.find((cur) => cur.id === curriculumId);
  if (curriculum) {
    return curriculum.exercises;
  }
  return null;
}