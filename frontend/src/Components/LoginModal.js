import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ show, handleClose, setIsLoggedIn, setUserRole }) => {
  const [formData, setFormData] = useState({ farmerRegNo: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!formData.farmerRegNo || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("https://ecochain-dashboard-backend.onrender.com/api/auth/login", formData);

      if (res.data.success) {
        // ✅ Save user info to localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("token", res.data.token);

        // ✅ Update parent states
        setUserRole(res.data.user.role);
        setIsLoggedIn(true);

        handleClose();

        navigate("/dashboard");
     
        // ✅ Redirect to dashboard (optional)
        window.location.href = "/dashboard";
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Farmer Login</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Farmer Registration No</Form.Label>
            <Form.Control
              name="farmerRegNo"
              placeholder="Enter your Farmer ID"
              value={formData.farmerRegNo}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;
