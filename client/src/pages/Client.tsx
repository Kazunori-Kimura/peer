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
            let peerId = localStorage.getItem('peer-id');
            if (typeof peerId !== 'string') {
                peerId = uuid();
                localStorage.setItem('peer-id', peerId);
            }
            setSourceId(peerId);
        }
    }, [sourceId]);

    return (
        <Layout>
            <Container maxWidth="lg">
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
