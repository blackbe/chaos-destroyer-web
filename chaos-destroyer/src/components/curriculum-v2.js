import React from 'react';
import VideoAnalysisFrame from './video-analysis-frame';
import LessonSummary from './lesson-summary';
import LessonPlan from './lesson-plan';

interface CurriculumV2Props {
  lessons: { title: string; summary: string }[];
}

const CurriculumV2 = ({ lessons }: CurriculumV2Props) => {
  return (
    <div>
      <LessonPlan lessons={lessons} />
      {/* Add curriculum elements here */}
    </div>
  );
};

export default CurriculumV2;
