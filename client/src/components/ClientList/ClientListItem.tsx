import { IconButton, ListItem, ListItemText, Tooltip } from '@mui/material';
import { MediaConnection } from 'peerjs';
import { useCallback } from 'react';
import { MdLinkOff } from 'react-icons/md';

export interface ClientListItemProps {
    peerId: string;
    connection: MediaConnection;
}

const ClientListItem: React.FC<ClientListItemProps> = ({ peerId, connection }) => {
    const handleDisconnect = useCallback(() => {
        connection.close();
    }, [connection]);

    return (
        <ListItem>
            <ListItemText primary={peerId} />
            <Tooltip title="切断">
                <IconButton size="small" edge="end" onClick={handleDisconnect}>
                    <MdLinkOff />
                </IconButton>
            </Tooltip>
        </ListItem>
    );
};

export default ClientListItem;
