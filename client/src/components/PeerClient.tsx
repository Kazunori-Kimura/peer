import { IconButton, Stack, Typography } from '@mui/material';
import { MediaConnection } from 'peerjs';
import { useCallback, useEffect, useRef } from 'react';
import { MdLinkOff } from 'react-icons/md';
import { setMediaStream } from '../lib/peer';

export interface PeerClientProps {
    peerId: string;
    connection: MediaConnection;
    stream?: MediaStream;
}

const PeerClient: React.FC<PeerClientProps> = ({ peerId, connection, stream }) => {
    const video = useRef<HTMLVideoElement>(null);

    const handleDisconnect = useCallback(() => {
        connection.close();
    }, [connection]);

    useEffect(() => {
        if (stream && video.current) {
            setMediaStream(video.current, stream, true);
        }
    }, [stream]);

    return (
        <Stack direction="column">
            <video ref={video} width={200} height={200} />
            <Stack direction="row" alignItems="center">
                <Typography
                    variant="caption"
                    sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: 140,
                        textOverflow: 'ellipsis',
                    }}
                >
                    {peerId}
                </Typography>
                <IconButton color="error" size="small" onClick={handleDisconnect}>
                    <MdLinkOff />
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default PeerClient;
