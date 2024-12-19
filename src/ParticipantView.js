import { useEffect, useRef } from "react";

const ParticipantView = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: '300px', border: '1px solid #ccc' }}></video>
    </div>
  );
};

export default ParticipantView;