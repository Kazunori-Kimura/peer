import { PeerJSOption } from 'peerjs';

export const peerOptions: PeerJSOption = {
    host: process.env.REACT_APP_PEER_HOST || 'localhost',
    path: process.env.REACT_APP_PEER_PATH || '/',
    secure: true,
};
