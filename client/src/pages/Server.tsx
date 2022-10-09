import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { DataConnection, MediaConnection, Peer } from 'peerjs';
import QRCode from 'qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MdPhotoCameraFront } from 'react-icons/md';
import { v4 as uuid } from 'uuid';
import ClientList from '../components/ClientList';
import { ClientListItemProps } from '../components/ClientList/ClientListItem';
import Layout from '../components/Layout';
import { getUserMediaAsync, peerOptions, setMediaStream } from '../lib/peer';

const host = process.env.REACT_APP_URL || 'http://localhost:3000';

const ServerPage: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [ownId, setOwnId] = useState('');
    const [qr, setQr] = useState<string>();
    const [clients, setClients] = useState<ClientListItemProps[]>([]);

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
        const id = uuid();
        const peer = new Peer(id, peerOptions);
        setOwnId(id);
        setConnected(true);

        // クライアント からの接続
        peer.on('connection', (conn: DataConnection) => {
            console.log('connection: ', conn.peer);
            conn.on('data', (data) => {
                console.log('message: ', data);

                if (data === 'disconnect') {
                    // 切断処理
                    setClients((state) => {
                        const newState = [...state].filter((client) => client.peerId !== conn.peer);
                        return newState;
                    });
                }
            });
        });

        // クライアント からの映像要求への応答
        peer.on('call', (call: MediaConnection) => {
            console.log('called: ', call.peer);
            // 応答する
            call.answer(stream);

            // クライアントを追加
            setClients((state) => {
                const client: ClientListItemProps = { peerId: call.peer, connection: call };
                const newState = [...state, client];
                return newState;
            });

            // 切断処理
            call.on('close', () => {
                console.log(`close: ${call.peer}`);
                // クライアントを削除
                setClients((state) => {
                    const newState = [...state].filter((client) => client.peerId !== call.peer);
                    return newState;
                });
            });
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
                        {/* 接続中のクライアント */}
                        {clients.length > 0 && <ClientList clients={clients} />}
                    </Stack>
                </Stack>
            </Container>
        </Layout>
    );
};

export default ServerPage;
