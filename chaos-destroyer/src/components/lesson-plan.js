import React from 'react';

interface LessonPlanProps {
  lessons: { title: string; summary: string }[];
}

const LessonPlan = ({ lessons }: LessonPlanProps) => {
  return (
    <div>
      {lessons.map((lesson, index) => (
        <LessonSummary key={index} lessonTitle={lesson.title} summary={lesson.summary} />
      ))}
    </div>
  );
};

export default LessonPlan;
