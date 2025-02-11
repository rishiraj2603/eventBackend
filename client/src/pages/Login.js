import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../services/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectMessage = location.state?.message;
  const redirectPath = location.state?.from || "/dashboard";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await auth.login(formData);
      login(response.data.user, response.data.token);
      navigate(redirectPath);
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await auth.guestLogin();
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>

          {redirectMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {redirectMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Or continue as a guest with limited access
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              gutterBottom
            >
              Note: Guest users cannot create events
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleGuestLogin}
              sx={{ mt: 1 }}
            >
              Continue as Guest
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
