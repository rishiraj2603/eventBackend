import { Box, Button, Container, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to Event Manager
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          color="textSecondary"
        >
          Create, manage, and join events with ease
        </Typography>
        {!user ? (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/login"
              size="large"
              sx={{ mr: 2 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/register"
              size="large"
            >
              Register
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/dashboard"
            size="large"
            sx={{ mt: 4 }}
          >
            Go to Dashboard
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default Home;
