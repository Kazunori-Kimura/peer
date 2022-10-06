import { Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import Layout from '../components/Layout';
import PeerComponent from '../components/Peer';

const ClientPage: React.FC = () => {
    const { code: desticationId } = useParams();
    const [sourceId, setSourceId] = useState<string>();

    useEffect(() => {
        if (typeof sourceId === 'undefined') {
            const peerId = uuid();
            setSourceId(peerId);
        }
    }, [sourceId]);

    return (
        <Layout>
            <Container>
                {sourceId && desticationId ? (
                    <PeerComponent sourceId={sourceId} destinationId={desticationId} />
                ) : (
                    <Typography variant="body1" color="primary">
                        接続中...
                    </Typography>
                )}
            </Container>
        </Layout>
    );
};

export default ClientPage;
