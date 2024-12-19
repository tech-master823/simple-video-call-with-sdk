import { useEffect, useRef, useState } from "react";
import PeerConnection from "./PeerConnection";
import { useParams } from "react-router-dom";
import ParticipantView from "./ParticipantView";
import { v4 as uuidv4 } from 'uuid';

const VideoChat = () => {
  const [localStream, setLocalStream] = useState(null);
  const [peerStream, setPeerStream] = useState(null);    
  const [peers, setPeers] = useState({});
  const localRef = useRef(null);
  const peerRef = useRef([]);
  const [studentId, setStudentId] = useState("");
  const { roomId, userId, role } = useParams();

  const createNewPeer = (data) => {
    const pc = new PeerConnection({ ...data, roomId, role });
    
    pc.on('peerStream', (stream) => {
      peerRef.current.push(pc);
      setPeers({ ...peers, [uuidv4()]: stream });

    }).start();
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);
      localRef.current = stream;
      if(role === "student") {
        window.socket.on('request-accept', ({ peerUserId, peerSocketId }) => {
          console.log("request-accept", peerUserId, peerSocketId);
          createNewPeer({ userId, peerUserId, peerSocketId, stream });
        })
        // window.socket.on("find-student", () => {
        //   alert("Find Student");
        // })
        .emit('request', { roomId, userId });
      } else if(role === "teacher") {
        window.socket.on("request", ({ peerUserId, peerSocketId }) => {
          console.log("request", peerUserId, peerSocketId);
          createNewPeer({ userId, peerUserId, peerSocketId, stream });
          window.socket.emit("request-accept", { to: peerSocketId, userId });
        })
        .emit("create-room", { roomId, userId });
      }
    });
    
  }, []);

  const findStudent = () => {
    window.socket.emit("find-student", { to: studentId, roomId });
  };

  return (
    <div>
      <h1>One-to-Many Video Communication</h1>
      <ParticipantView stream={localStream} />
      {/* <ParticipantView stream={peerStream} /> */}
      {/* <video ref={localRef} autoPlay playsInline style={{ width: '300px', border: '1px solid #ccc' }}></video>
      <video ref={peerRef} autoPlay playsInline style={{ width: '300px', border: '1px solid #ccc' }}></video> */}
      {
        peers && Object.keys(peers).map((peerUserId) => {
          return (
            <ParticipantView
              key={peerUserId}
              stream={peers[peerUserId]}
            />
          );
        })
      }
      {/* Replace this ID with the actual peer ID of the connecting users */}
      { role === "teacher" && (
        <>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <button onClick={findStudent}>Find Student</button>
        </>
      )}  
    </div>
  );
};

export default VideoChat;