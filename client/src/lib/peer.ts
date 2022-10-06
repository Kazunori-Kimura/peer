import { PeerJSOption } from 'peerjs';

export const peerOptions: PeerJSOption = {
    host: process.env.REACT_APP_PEER_HOST || 'localhost',
    path: process.env.REACT_APP_PEER_PATH || '/',
    secure: true,
};

export async function getUserMediaAsync(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}

export function setMediaStream(video: HTMLVideoElement, stream: MediaStream, muted = false) {
    video.srcObject = stream;
    video.volume = muted ? 0 : 1;
    // 準備できたら再生
    video.onloadedmetadata = () => video.play();
}
