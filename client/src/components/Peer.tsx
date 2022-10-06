import { Stack, Typography } from '@mui/material';
import Peer, { DataConnection } from 'peerjs';
import { useEffect, useRef } from 'react';
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

function call(peer: Peer, destinationId: string, stream: MediaStream): Promise<MediaStream> {
    return new Promise((resolve) => {
        // 相手に発信する
        const call = peer.call(destinationId, stream);
        console.log(`call: -> ${destinationId}`);
        // 返答
        call.on('stream', (remoteStream) => {
            console.log(`stream: ${destinationId} ->`);
            resolve(remoteStream);
        });
    });
}

async function connectPeer(
    sourceId: string,
    destinationId: string,
    sourceVideo: HTMLVideoElement,
    destVideo: HTMLVideoElement
) {
    // peer client を作成して open する
    const peer = await open(sourceId);

    const stream = await getUserMediaAsync();
    // 自分のカメラ画像を video に表示
    setMediaStream(sourceVideo, stream, true);

    // 相手に接続する
    await connect(peer, destinationId);

    // 相手に発信する
    const remoteStream = await call(peer, destinationId, stream);
    // 相手のカメラ画像を video に表示
    setMediaStream(destVideo, remoteStream);
}

const PeerComponent: React.FC<Props> = ({ sourceId, destinationId }) => {
    const sourceVideo = useRef<HTMLVideoElement>(null);
    const destVideo = useRef<HTMLVideoElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        if (sourceVideo.current && destVideo.current) {
            // 呼び出し
            connectPeer(sourceId, destinationId, sourceVideo.current, destVideo.current);
        }
    }, [destinationId, sourceId]);

    return (
        <Stack direction="column">
            <Typography component="h2" variant="h6">
                通話画面
            </Typography>
            {/* destination */}
            <video ref={destVideo} width={400} height={400} />
            {/* source */}
            <video ref={sourceVideo} width={200} height={200} />
        </Stack>
    );
};

export default PeerComponent;
