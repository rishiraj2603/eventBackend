import PersonIcon from "@mui/icons-material/Person";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Snackbar,
  Typography,
  CircularProgress,
} from "@mui/material";
import { formatDistanceToNow, isPast, isWithinInterval } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { events } from "../services/api";

const categories = ["All", "Conference", "Workshop", "Meetup", "Other"];

function EventDashboard() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newEvent", (event) => {
      setEventsList((prev) => [...prev, event]);
      setNotification({
        open: true,
        message: `New event created: ${event.title}`,
        severity: "info",
      });
    });

    socket.on("eventUpdated", (updatedEvent) => {
      setEventsList((prev) =>
        prev.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    });

    socket.on("eventDeleted", (eventId) => {
      setEventsList((prev) => prev.filter((event) => event._id !== eventId));
      setNotification({
        open: true,
        message: "Event has been deleted",
        severity: "warning",
      });
    });

    socket.on("attendeeJoined", ({ event, attendeeCount, joiningUser }) => {
      setEventsList((prev) =>
        prev.map((e) => (e._id === event._id ? event : e))
      );
      setNotification({
        open: true,
        message: `${event.title} - ${joiningUser} joined the event`,
        severity: "success",
      });
    });

    socket.on("attendeeLeft", ({ event, attendeeCount, leavingUser }) => {
      setEventsList((prev) =>
        prev.map((e) => (e._id === event._id ? event : e))
      );
      setNotification({
        open: true,
        message: `${event.title} - ${leavingUser} left the event`,
        severity: "info",
      });
    });

    return () => {
      socket.off("newEvent");
      socket.off("eventUpdated");
      socket.off("eventDeleted");
      socket.off("attendeeJoined");
      socket.off("attendeeLeft");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !eventsList.length) return;

    eventsList.forEach((event) => {
      socket.emit("joinEventRoom", event._id);
    });

    return () => {
      eventsList.forEach((event) => {
        socket.emit("leaveEventRoom", event._id);
      });
    };
  }, [socket, eventsList]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await events.getAll();
      setEventsList(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleJoinEvent = async (e, eventId) => {
    e.stopPropagation(); // Prevent card click when clicking join button
    try {
      await events.join(eventId);
      fetchEvents();
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleUnjoinEvent = async (e, eventId) => {
    e.stopPropagation(); // Prevent card click when clicking unjoin button
    try {
      await events.unjoin(eventId);
      fetchEvents();
    } catch (error) {
      console.error("Error unjoining event:", error);
    }
  };

  const groupEvents = (events) => {
    const now = new Date();
    return {
      live: events.filter((event) =>
        isWithinInterval(now, {
          start: new Date(event.startDate),
          end: new Date(event.endDate),
        })
      ),
      upcoming: events.filter((event) => new Date(event.startDate) > now),
      past: events.filter((event) => isPast(new Date(event.endDate))),
    };
  };

  const renderEventGroup = (events, title) =>
    events.length > 0 && (
      <>
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {title}
        </Typography>
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 6 },
                }}
                onClick={() => handleCardClick(event._id)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {event.description}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {event.creator._id === user?.id ? (
                        <Chip
                          label="Created by you"
                          color="primary"
                          size="small"
                        />
                      ) : (
                        `Created by: ${event.creator.username}`
                      )}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Attendees: {event.attendees.length}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {event.location && (
                        <>
                          📍 {event.location}
                          <br />
                        </>
                      )}
                      {isPast(new Date(event.endDate)) ? (
                        <>
                          🏁 Ended{" "}
                          {formatDistanceToNow(new Date(event.endDate), {
                            addSuffix: true,
                          })}
                        </>
                      ) : isWithinInterval(new Date(), {
                          start: new Date(event.startDate),
                          end: new Date(event.endDate),
                        }) ? (
                        <>🔴 Event is live</>
                      ) : (
                        <>
                          🕒 Starts{" "}
                          {formatDistanceToNow(new Date(event.startDate), {
                            addSuffix: true,
                          })}
                        </>
                      )}
                    </Typography>
                  </Box>

                  {user && (
                    <Button
                      variant="contained"
                      color={
                        event.attendees.some((a) => a._id === user.id)
                          ? "secondary"
                          : "primary"
                      }
                      fullWidth
                      sx={{
                        mt: 2,
                        opacity: isPast(new Date(event.endDate)) ? 0.7 : 1,
                      }}
                      disabled={
                        new Date() < new Date(event.startDate) ||
                        new Date() > new Date(event.endDate)
                      }
                      onClick={(e) => {
                        const isJoined = event.attendees.some(
                          (a) => a._id === user.id
                        );
                        if (isJoined) {
                          handleUnjoinEvent(e, event._id);
                        } else {
                          handleJoinEvent(e, event._id);
                        }
                      }}
                    >
                      {event.attendees.some((a) => a._id === user.id)
                        ? "Unjoin"
                        : new Date() < new Date(event.startDate)
                        ? "Event not started"
                        : isPast(new Date(event.endDate))
                        ? "Event ended"
                        : "Join Event"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Events Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : eventsList.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 4 }}>
          No events found
        </Typography>
      ) : (
        <>
          {renderEventGroup(groupEvents(eventsList).live, "🔴 Live Right Now")}
          {renderEventGroup(
            groupEvents(eventsList).upcoming,
            "📅 Upcoming Events"
          )}
          {renderEventGroup(groupEvents(eventsList).past, "📁 Past Events")}
        </>
      )}

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

export default EventDashboard;
