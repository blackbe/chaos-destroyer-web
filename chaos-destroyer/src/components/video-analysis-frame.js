import React from 'react';

interface VideoAnalysisFrameProps {
  videoUrl: string;
}

const VideoAnalysisFrame = ({ videoUrl }: VideoAnalysisFrameProps) => {
  const [videoElement, setVideoElement] = React.useState<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (videoElement) {
      // Initialize video player
      videoElement.src = videoUrl;
    }
  }, [videoUrl]);

  return (
    <div>
      <video ref={setVideoElement} controls />
    </div>
  );
};

export default VideoAnalysisFrame;
