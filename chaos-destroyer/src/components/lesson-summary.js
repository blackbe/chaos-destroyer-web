import React from 'react';

interface LessonSummaryProps {
  lessonTitle: string;
  summary: string;
}

const LessonSummary = ({ lessonTitle, summary }: LessonSummaryProps) => {
  return (
    <div>
      <h2>{lessonTitle}</h2>
      <p>{summary}</p>
    </div>
  );
};

export default LessonSummary;
