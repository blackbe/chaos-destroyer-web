import React from 'react';
import VideoAnalysisFrame from './video-analysis-frame';

interface VideoAnalysisToolProps {
  videoUrl: string;
}

const VideoAnalysisTool = ({ videoUrl }: VideoAnalysisToolProps) => {
  return (
    <div>
      <VideoAnalysisFrame videoUrl={videoUrl} />
      {/* Add analysis tools here */}
    </div>
  );
};

export default VideoAnalysisTool;
