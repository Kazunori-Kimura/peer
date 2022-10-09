import { Box, List, SxProps, Theme } from '@mui/material';
import ClientListItem, { ClientListItemProps } from './ClientListItem';

interface Props {
    clients: ClientListItemProps[];
    sx?: SxProps<Theme>;
}

const ClientList: React.FC<Props> = ({ clients, sx = {} }) => {
    return (
        <Box
            sx={{
                borderColor: (theme) => theme.palette.divider,
                borderStyle: 'solid',
                borderWidth: 1,
                backgroundColor: (theme) => theme.palette.background.paper,
                overflowY: 'auto',
                ...sx,
            }}
        >
            <List dense>
                {clients.map((client) => (
                    <ClientListItem key={client.peerId} {...client} />
                ))}
            </List>
        </Box>
    );
};

export default ClientList;
