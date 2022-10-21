import { Box, Button, Stack, Typography } from '@mui/material';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { useCallback, useRef, useState } from 'react';
import { MdLink, MdLinkOff } from 'react-icons/md';
import { peerOptions, setMediaStream } from '../lib/peer';

interface Props {
    sourceId: string;
    destinationId: string;
}

function open(sourceId: string): Promise<Peer> {
    return new Promise((resolve) => {
        const peer = new Peer(sourceId, peerOptions);
        peer.on('error', (e) => console.error(e));
        peer.on('open', (id) => {
            console.log('open peer client: ', id);
            resolve(peer);
        });
    });
}

function connect(peer: Peer, destinationId: string): Promise<DataConnection> {
    return new Promise((resolve) => {
        // 相手に接続する
        const conn = peer.connect(destinationId);
        conn.on('open', () => {
            console.log(`connect: -> ${destinationId}`);
            resolve(conn);
        });
    });
}

function call(
    peer: Peer,
    destinationId: string,
    stream: MediaStream
): Promise<[MediaConnection, MediaStream]> {
    return new Promise((resolve) => {
        // 相手に発信する
        const call = peer.call(destinationId, stream);
        console.log(`call: -> ${destinationId}`);
        // 返答
        call.on('stream', (remoteStream) => {
            console.log(`stream: ${destinationId} ->`);
            resolve([call, remoteStream]);
        });
    });
}

async function connectPeer(
    sourceId: string,
    destinationId: string,
    destVideo: HTMLVideoElement
): Promise<[Peer, DataConnection, MediaConnection]> {
    // peer client を作成して open する
    const peer = await open(sourceId);

    // 相手に接続する
    const dc = await connect(peer, destinationId);

    // ダミーのstreamを生成する
    const canvas = document.createElement('canvas');
    const stream = canvas.captureStream(0);
    // 相手に発信する
    const [mc, remoteStream] = await call(peer, destinationId, stream);
    // 相手のカメラ画像を video に表示
    setMediaStream(destVideo, remoteStream);

    return [peer, dc, mc];
}

const PeerComponent: React.FC<Props> = ({ sourceId, destinationId }) => {
    const destVideo = useRef<HTMLVideoElement>(null);
    const peer = useRef<Peer>();
    const mediaConn = useRef<MediaConnection>();
    const dataConn = useRef<DataConnection>();

    const [connected, setConnected] = useState(false);

    const handleCall = useCallback(async () => {
        if (destVideo.current) {
            try {
                // 一度 video の play を呼び出しておく
                destVideo.current.play().catch(() => {});
                destVideo.current.pause();
            } catch {
                // 何もしない
            }

            // 呼び出し
            [peer.current, dataConn.current, mediaConn.current] = await connectPeer(
                sourceId,
                destinationId,
                destVideo.current
            );
            setConnected(true);
        }
    }, [destinationId, sourceId]);

    const handleDisconnect = useCallback(() => {
        if (peer.current && dataConn.current && mediaConn.current) {
            dataConn.current.send('disconnect');

            mediaConn.current.close();
            mediaConn.current = undefined;
            dataConn.current.close();
            dataConn.current = undefined;
            peer.current.disconnect();
            peer.current = undefined;
        }
        setConnected(false);
    }, []);

    return (
        <Stack direction="column" sx={{ pt: 1 }} spacing={2}>
            <Stack
                direction="column"
                spacing={1}
                sx={{
                    width: (theme) => theme.breakpoints.values.sm,
                    margin: '0 auto',
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: (theme) => theme.breakpoints.values.sm,
                        textOverflow: 'ellipsis',
                    }}
                >
                    {`ID: ${sourceId}`}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        startIcon={<MdLink />}
                        size="large"
                        variant="contained"
                        color="primary"
                        disabled={connected}
                        sx={{ flex: 1 }}
                        onClick={handleCall}
                    >
                        接続
                    </Button>
                    <Button
                        startIcon={<MdLinkOff />}
                        size="large"
                        variant="contained"
                        color="error"
                        disabled={!connected}
                        sx={{ flex: 1 }}
                        onClick={handleDisconnect}
                    >
                        切断
                    </Button>
                </Stack>
            </Stack>
            {/* destination video */}
            <Box
                sx={(theme) => ({
                    flex: 1,
                    width: '100%',
                    [theme.breakpoints.up('lg')]: {
                        width: theme.breakpoints.values.lg,
                    },
                })}
            >
                <video ref={destVideo} width="100%" height="100%" />
            </Box>
        </Stack>
    );
};

export default PeerComponent;
