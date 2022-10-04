import { AppBar, Avatar, CssBaseline, Toolbar, Typography } from '@mui/material';
import { orange } from '@mui/material/colors';
import { ReactNode } from 'react';
import { GiCat } from 'react-icons/gi';
import { Link } from 'react-router-dom';

interface Props {
    children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <>
            <CssBaseline />
            <AppBar position="fixed">
                <Toolbar>
                    <Avatar
                        component={Link}
                        to="/"
                        sx={{ bgcolor: orange['A400'] }}
                        variant="rounded"
                    >
                        <GiCat />
                    </Avatar>
                    <Typography component="h1" variant="h6" sx={{ ml: 2 }}>
                        PeerApp
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar />
            {children}
        </>
    );
};

export default Layout;
