import React, { useEffect, useRef, useState } from 'react';

export default function VideoConference(){
  const iframeRef = useRef(null);
  const [room, setRoom] = useState(() => {
    // persistent room name per session
    const rid = localStorage.getItem('videoRoom') || `ruralcare-room-${Date.now()}`;
    localStorage.setItem('videoRoom', rid);
    return rid;
  });
  const [displayName, setDisplayName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.name || 'Guest';
    } catch(e){
      return 'Guest';
    }
  });

  const src = `https://meet.jit.si/${room}#userInfo.displayName="${encodeURIComponent(displayName)}"`;
  useEffect(() => {
    // nothing special
  }, [room, displayName]);

  return (
    <div style={{padding:20}}>
      <h2>Video Conference</h2>
      <div style={{marginBottom:10}}>
        <label>Room: <input value={room} onChange={e=>setRoom(e.target.value)} style={{width:300}} /></label>
        <label style={{marginLeft:10}}>Name: <input value={displayName} onChange={e=>setDisplayName(e.target.value)} /></label>
      </div>
      <div style={{height:'70vh', border:'1px solid #ccc'}}>
        <iframe
          ref={iframeRef}
          title="jitsi"
          src={src}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          style={{width:'100%', height:'100%', border:0}}
        />
      </div>
      <p style={{marginTop:10}}>Controls (host/participants can use Jitsi toolbar inside iframe): camera, mic, screen share, raise hand, chat, end call.</p>
    </div>
  );
}