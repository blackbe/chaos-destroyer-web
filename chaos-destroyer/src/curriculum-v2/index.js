import React from 'react';
import CurriculumV2 from './components/curriculum-v2';

const videoUrl = 'https://example.com/video.mp4';

const lessons = [
  { title: 'Lesson 1', summary: 'Summary of Lesson 1' },
  { title: 'Lesson 2', summary: 'Summary of Lesson 2' },
];

const App = () => {
  return (
    <CurriculumV2 lessons={lessons} />
  );
};

export default App;
