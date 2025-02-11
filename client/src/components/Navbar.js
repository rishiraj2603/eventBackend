import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Tooltip,
  Avatar,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const getInitials = (username) => {
    return username
      .split("_")[0]
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to={user ? "/dashboard" : "/welcome"}
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          Event Manager
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard">
                Dashboard
              </Button>
              {user.isGuest ? (
                <Tooltip title="Please register or login to create events">
                  <span>
                    <Button color="inherit" disabled sx={{ opacity: 0.7 }}>
                      Create Event
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/create-event"
                >
                  Create Event
                </Button>
              )}
              <Chip
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: user.isGuest ? "warning.main" : "primary.main",
                    }}
                  >
                    {getInitials(user.username)}
                  </Avatar>
                }
                label={
                  <Box
                    component="span"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    {user.username}
                    {user.isGuest && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          bgcolor: "warning.main",
                          color: "warning.contrastText",
                          px: 0.5,
                          borderRadius: 0.5,
                          ml: 0.5,
                        }}
                      >
                        GUEST
                      </Typography>
                    )}
                  </Box>
                }
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "inherit",
                  "& .MuiChip-label": {
                    color: "inherit",
                  },
                }}
              />
              <Button
                color="inherit"
                onClick={logout}
                size="small"
                variant="outlined"
                sx={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
