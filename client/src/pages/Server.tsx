import { Container, Stack, Typography } from '@mui/material';
import { DataConnection, MediaConnection, Peer } from 'peerjs';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Layout from '../components/Layout';
import PeerClient, { PeerClientProps } from '../components/PeerClient';
import { getUserMediaAsync, peerOptions, setMediaStream } from '../lib/peer';

const host = process.env.REACT_APP_URL || 'http://localhost:3000';

const ServerPage: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [ownId, setOwnId] = useState('empty');
    const [qr, setQr] = useState<string>();
    const [clients, setClients] = useState<Record<string, PeerClientProps>>({});

    const sourceRef = useRef<HTMLVideoElement>(null);
    const destRef = useRef<HTMLVideoElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        const id = uuid();
        const peer = new Peer(id, peerOptions);
        setOwnId(id);

        // クライアント からの接続
        peer.on('connection', (conn: DataConnection) => {
            console.log('connection: ', conn.peer);
            conn.on('data', (data) => {
                console.log('message: ', data);

                if (data === 'disconnect') {
                    // 切断処理
                    setClients((state) => {
                        const newState = { ...state };
                        delete newState[conn.peer];
                        return newState;
                    });
                }
            });
        });

        // クライアント からの映像要求への応答
        peer.on('call', async (call: MediaConnection) => {
            console.log('called: ', call.peer);
            const stream = await getUserMediaAsync();
            // 応答する
            call.answer(stream);

            setClients((state) => {
                const newState = {
                    ...state,
                    [call.peer]: {
                        peerId: call.peer,
                        connection: call,
                    },
                };
                return newState;
            });

            // 自分の映像を表示
            if (sourceRef.current) {
                setMediaStream(sourceRef.current, stream, true);
            }

            // クライアントからの映像
            call.on('stream', (remoteStream) => {
                console.log(`stream: ${call.peer}`);
                setClients((state) => {
                    const newState = {
                        ...state,
                        [call.peer]: {
                            peerId: call.peer,
                            connection: call,
                            stream: remoteStream,
                        },
                    };
                    return newState;
                });

                if (destRef.current) {
                    setMediaStream(destRef.current, remoteStream);
                }
            });

            // 切断処理
            call.on('close', () => {
                console.log(`close: ${call.peer}`);
                setClients((state) => {
                    const newState = { ...state };
                    delete newState[call.peer];
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
        const url = `${host}/#/c/${ownId}`;
        QRCode.toDataURL(url).then((data) => setQr(data));
    }, [ownId]);

    return (
        <Layout>
            <Container>
                <Stack direction="column" spacing={1}>
                    {connected ? (
                        <>
                            {/* QRコード */}
                            {qr && <img src={qr} alt="QRコード" width={200} height={200} />}
                            <Typography variant="body2">{`${host}/#/c/${ownId}`}</Typography>
                            {/* 自身の映像 */}
                            <video ref={sourceRef} width={400} height={400} />
                            {/* 相手の映像 */}
                            <Stack direction="row" spacing={1}>
                                {Object.values(clients).map((client) => (
                                    <PeerClient key={client.peerId} {...client} />
                                ))}
                            </Stack>
                        </>
                    ) : (
                        <Typography variant="body2">接続中...</Typography>
                    )}
                </Stack>
            </Container>
        </Layout>
    );
};

export default ServerPage;
