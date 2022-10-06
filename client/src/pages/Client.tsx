import { Typography } from '@mui/material';
import { Peer } from 'peerjs';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import Layout from '../components/Layout';
import { peerOptions } from '../lib/peer';

const ClientPage: React.FC = () => {
    const { code } = useParams();

    const connected = useRef(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (code) {
            if (connected.current) {
                return;
            }

            const peerId = uuid();
            const peer = new Peer(peerId, peerOptions);

            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    // 接続要求
                    const call = peer.call(code, stream);
                    // Server からの映像受信
                    call.on('stream', (remoteStream) => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = remoteStream;
                            // 準備できたら再生
                            videoRef.current.onloadedmetadata = () => videoRef.current?.play();
                        }
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [code]);

    return (
        <Layout>
            <Typography variant="h1" component="h2">
                Client
            </Typography>
            <video ref={videoRef} width={400} height={400} />
        </Layout>
    );
};

export default ClientPage;
