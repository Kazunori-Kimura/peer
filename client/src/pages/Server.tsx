import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { DataConnection, MediaConnection, Peer } from 'peerjs';
import QRCode from 'qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MdPhotoCameraFront } from 'react-icons/md';
import { v4 as uuid } from 'uuid';
import Layout from '../components/Layout';
import { getUserMediaAsync, peerOptions, setMediaStream } from '../lib/peer';

const host = process.env.REACT_APP_URL || 'http://localhost:3000';
const ServerPeerIdKey = 'peer-server-key';

const ServerPage: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [ownId, setOwnId] = useState('');
    const [qr, setQr] = useState<string>();

    const sourceRef = useRef<HTMLVideoElement>(null);

    // iOS 対応
    // iOS ではユーザーの操作をトリガーにしないと
    // videoタグでの stream 再生ができない
    const handleStart = useCallback(async () => {
        try {
            if (sourceRef.current) {
                // video タグの再生 (例外は無視)
                sourceRef.current.play().catch(() => {});
                // 即停止
                sourceRef.current.pause();
            }
        } catch {} // 例外は無視

        // カメラ画像を取得
        const stream = await getUserMediaAsync();
        // 自分の映像を表示
        if (sourceRef.current) {
            setMediaStream(sourceRef.current, stream, true);
        }

        // PeerServer への接続
        let peerId = localStorage.getItem(ServerPeerIdKey);
        if (typeof peerId !== 'string') {
            peerId = uuid();
            localStorage.setItem(ServerPeerIdKey, peerId);
        }
        const peer = new Peer(peerId, peerOptions);
        setOwnId(peerId);
        setConnected(true);

        // クライアント からの接続
        peer.on('connection', (conn: DataConnection) => {
            console.log('connection: ', conn.peer);
            conn.on('data', (data) => {
                console.log('message: ', data);
            });
        });

        // クライアント からの映像要求への応答
        peer.on('call', (call: MediaConnection) => {
            console.log('called: ', call.peer);
            // 応答する
            call.answer(stream);
        });

        peer.on('open', (id) => {
            console.log('open: ', id);
            setConnected(true);
        });
        peer.on('error', (err) => {
            console.error(err);
        });
    }, []);

    // QRコード
    useEffect(() => {
        if (ownId) {
            const url = `${host}/#/c/${ownId}`;
            QRCode.toDataURL(url).then((data) => setQr(data));
        }
    }, [ownId]);

    return (
        <Layout>
            <Container maxWidth="xl">
                <Stack direction="row" spacing={1}>
                    <Box flexGrow={1} sx={{ height: 'calc(100vh - 72px)', pt: 1 }}>
                        {/* 自身の映像 */}
                        <video ref={sourceRef} width="100%" height="100%" />
                    </Box>
                    <Stack direction="column" spacing={1} sx={{ width: 200, pt: 1 }}>
                        {!connected && (
                            <Button
                                startIcon={<MdPhotoCameraFront />}
                                color="primary"
                                variant="contained"
                                onClick={handleStart}
                            >
                                カメラ起動
                            </Button>
                        )}
                        {/* QRコード */}
                        {qr && <img src={qr} alt="QRコード" width={200} height={200} />}
                        {ownId && <Typography variant="body2">{`${host}/#/c/${ownId}`}</Typography>}
                    </Stack>
                </Stack>
            </Container>
        </Layout>
    );
};

export default ServerPage;
