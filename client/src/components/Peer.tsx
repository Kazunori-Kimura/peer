import { Button, Stack, Typography } from '@mui/material';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { useCallback, useRef, useState } from 'react';
import { MdLink, MdLinkOff } from 'react-icons/md';
import { getUserMediaAsync, peerOptions, setMediaStream } from '../lib/peer';

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
    sourceVideo: HTMLVideoElement,
    destVideo: HTMLVideoElement
): Promise<[Peer, DataConnection, MediaConnection]> {
    // peer client を作成して open する
    const peer = await open(sourceId);

    const stream = await getUserMediaAsync();
    // 自分のカメラ画像を video に表示
    setMediaStream(sourceVideo, stream, true);

    // 相手に接続する
    const dc = await connect(peer, destinationId);

    // 相手に発信する
    const [mc, remoteStream] = await call(peer, destinationId, stream);
    // 相手のカメラ画像を video に表示
    setMediaStream(destVideo, remoteStream);

    return [peer, dc, mc];
}

const PeerComponent: React.FC<Props> = ({ sourceId, destinationId }) => {
    const sourceVideo = useRef<HTMLVideoElement>(null);
    const destVideo = useRef<HTMLVideoElement>(null);
    const peer = useRef<Peer>();
    const mediaConn = useRef<MediaConnection>();
    const dataConn = useRef<DataConnection>();

    const [connected, setConnected] = useState(false);

    const handleCall = useCallback(async () => {
        if (sourceVideo.current && destVideo.current) {
            try {
                // 一度 video の play を呼び出しておく
                sourceVideo.current.play().catch(() => {});
                sourceVideo.current.pause();
                destVideo.current.play().catch(() => {});
                destVideo.current.pause();
            } catch {
                // 何もしない
            }

            // 呼び出し
            [peer.current, dataConn.current, mediaConn.current] = await connectPeer(
                sourceId,
                destinationId,
                sourceVideo.current,
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
        <Stack direction="column" sx={{ pt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                    variant="body1"
                    sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: 200,
                        textOverflow: 'ellipsis',
                    }}
                >
                    {`ID: ${sourceId}`}
                </Typography>
                <Button
                    startIcon={<MdLink />}
                    size="large"
                    variant="contained"
                    color="primary"
                    disabled={connected}
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
                    onClick={handleDisconnect}
                >
                    切断
                </Button>
            </Stack>
            {/* destination */}
            <video ref={destVideo} width={400} height={400} />
            {/* source */}
            <video ref={sourceVideo} width={200} height={200} />
        </Stack>
    );
};

export default PeerComponent;
