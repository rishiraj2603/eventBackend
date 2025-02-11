import PersonIcon from "@mui/icons-material/Person";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { events } from "../services/api";

function EventDetails() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("joinEventRoom", id);

    socket.on("attendeeJoined", ({ event: updatedEvent, joiningUser }) => {
      setEvent(updatedEvent);
      setNotification({
        open: true,
        message: `${updatedEvent.title} - ${joiningUser} joined the event`,
        severity: "success",
      });
    });

    socket.on("attendeeLeft", ({ event: updatedEvent, leavingUser }) => {
      setEvent(updatedEvent);
      setNotification({
        open: true,
        message: `${updatedEvent.title} - ${leavingUser} left the event`,
        severity: "info",
      });
    });

    socket.on("eventUpdated", (updatedEvent) => {
      setEvent(updatedEvent);
    });

    socket.on("eventDeleted", (eventId) => {
      if (eventId === id) {
        navigate("/dashboard");
      }
    });

    return () => {
      socket.emit("leaveEventRoom", id);
      socket.off("attendeeJoined");
      socket.off("attendeeLeft");
      socket.off("eventUpdated");
      socket.off("eventDeleted");
    };
  }, [socket, id]);

  const fetchEvent = async () => {
    try {
      const response = await events.getAll();
      const foundEvent = response.data.find((e) => e._id === id);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setError("Event not found");
      }
    } catch (error) {
      setError("Error fetching event details");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    try {
      await events.join(id);
      fetchEvent();
    } catch (error) {
      setError("Error joining event");
    }
  };

  const handleUnjoinEvent = async () => {
    try {
      await events.unjoin(id);
      fetchEvent();
    } catch (error) {
      setError("Error unjoining event");
    }
  };

  const handleDisconnect = () => {
    navigate("/");
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!event) return <Typography>Event not found</Typography>;

  const isCreator = user?.id === event.creator._id;
  const isAttendee = event.attendees.some((a) => a._id === user?.id);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {event.title}
          </Typography>

          <Box sx={{ mb: 3 }}>
            {isCreator ? (
              <Chip
                icon={<PersonIcon />}
                label="Created by you"
                color="primary"
                sx={{ mr: 1 }}
              />
            ) : (
              <Chip
                icon={<PersonIcon />}
                label={`Created by ${event.creator.username}`}
                variant="outlined"
                sx={{ mr: 1 }}
              />
            )}
            <Chip
              label={`${event.attendees.length} Attendees`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Typography variant="body1" paragraph>
            {event.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Attendees
          </Typography>
          <List>
            {event.attendees.map((attendee) => (
              <ListItem key={attendee._id}>
                <ListItemText
                  primary={
                    <>
                      {attendee.username}
                      {attendee._id === event.creator._id && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (Creator)
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            {user && (
              <>
                <Button
                  variant="contained"
                  color={isAttendee ? "secondary" : "primary"}
                  onClick={isAttendee ? handleUnjoinEvent : handleJoinEvent}
                >
                  {isAttendee ? "Unjoin Event" : "Join Event"}
                </Button>
                <Button variant="outlined" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
            {!user && (
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Login to Join Event
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EventDetails;
