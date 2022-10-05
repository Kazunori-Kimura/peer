import { Container, Stack, Typography } from '@mui/material';
import { DataConnection, MediaConnection, Peer } from 'peerjs';
import QRCode from 'qrcode';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Layout from '../components/Layout';
import { peerOptions } from '../lib/peer';

const host = process.env.REACT_APP_URL || 'http://localhost:3000';

const ServerPage: React.FC = () => {
    const [ownId, setOwnId] = useState('empty');
    const [qr, setQr] = useState<string>();

    const videoRef = useRef<HTMLVideoElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }
        initialized.current = true;
        const id = uuid();
        const peer = new Peer(id, peerOptions);
        setOwnId(id);

        // -- handlers --
        const connectionHandler = (conn: DataConnection) => {
            console.log(conn.peer);
        };
        const callHandler = async (call: MediaConnection) => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            call.answer(stream);
        };

        // -- bind handlers --
        // クライアント からの接続
        peer.on('connection', connectionHandler);
        // クライアント からの映像要求
        peer.on('call', callHandler);

        return () => {
            peer.off('connection', connectionHandler);
            peer.off('call', callHandler);
        };
    }, []);

    // カメラ画像の取り込み
    useLayoutEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // 準備できたら再生
                videoRef.current.onloadedmetadata = () => videoRef.current?.play();
            }
        });
    }, []);

    // QRコード
    useEffect(() => {
        const url = `${host}/c/${ownId}`;
        QRCode.toDataURL(url).then((data) => setQr(data));
    }, [ownId]);

    return (
        <Layout>
            <Container>
                <Stack direction="column" spacing={1}>
                    {/* QRコード */}
                    {qr && <img src={qr} alt="QRコード" width={200} height={200} />}
                    <Typography variant="body2">{`${host}/c/${ownId}`}</Typography>
                    {/* 自身の映像 */}
                    <video ref={videoRef} width={400} height={400} />
                </Stack>
            </Container>
        </Layout>
    );
};

export default ServerPage;
