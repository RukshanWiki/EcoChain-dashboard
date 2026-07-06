// import React, { useState } from "react";
// import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
// import axios from "axios";

// // --- SRI LANKA GEOGRAPHIC DATA ---
// const locationData = {
//   "Central": ["Kandy", "Matale", "Nuwara Eliya"],
//   "Eastern": ["Ampara", "Batticaloa", "Trincomalee"],
//   "North Central": ["Anuradhapura", "Polonnaruwa"],
//   "North Western": ["Kurunegala", "Puttalam"],
//   "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
//   "Sabaragamuwa": ["Kegalle", "Ratnapura"],
//   "Southern": ["Galle", "Hambantota", "Matara"],
//   "Uva": ["Badulla", "Moneragala"],
//   "Western": ["Colombo", "Gampaha", "Kalutara"]
// };

// const RegisterModal = ({ show, handleClose, openLogin }) => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     nic: "",
//     farmerRegNo: "",
//     province: "",
//     district: "",
//     mobile: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState("");
//   const [nicChecking, setNicChecking] = useState(false);

//   // --- HANDLE INPUT CHANGES ---
//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Clear error as soon as user starts typing to correct a mistake
//     if (error) setError("");

//     if (name === "province") {
//       setFormData({ ...formData, province: value, district: "" });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   // --- NIC LOGICAL VALIDATION (Sri Lankan Rules) ---
//   const validateNICLogic = (nic) => {
//     const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/i;
//     if (!nicRegex.test(nic)) return { valid: false, msg: "Invalid NIC format." };

//     let dayOfYear;
//     if (nic.length === 10) {
//       dayOfYear = parseInt(nic.substring(2, 5));
//     } else {
//       dayOfYear = parseInt(nic.substring(4, 7));
//     }

//     const actualDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
//     if (actualDay < 1 || actualDay > 366) return { valid: false, msg: "Invalid date encoded in NIC." };

//     return { valid: true };
//   };

//   // --- BACKEND EXISTENCE CHECK ---
//   const handleNicBlur = async () => {
//     if (!formData.nic) {
//         setError("");
//         return;
//     }
    
//     // Clear previous error before starting new check
//     setError(""); 

//     const logicCheck = validateNICLogic(formData.nic);
//     if (!logicCheck.valid) {
//       setError(`❌ ${logicCheck.msg}`);
//       return;
//     }

//     setNicChecking(true);
//     try {
//       const res = await axios.get(`https://ecochain-dashboard-backend.onrender.com/api/auth/check-nic/${formData.nic}`);
//       if (res.data.exists) {
//         setError("❌ This NIC is already registered to another account.");
//       }
//     } catch (err) {
//       console.error("NIC check failed");
//     } finally {
//       setNicChecking(false);
//     }
//   };

//   // --- FINAL REGISTRATION ---
//   const handleRegister = async () => {
//     setError("");
//     setSuccess(false);

//     // Required field validation (No email here)
//     const mandatory = ["fullName", "nic", "farmerRegNo", "province", "district", "mobile", "password", "confirmPassword"];
//     for (let key of mandatory) {
//       if (!formData[key]) {
//         setError("❌ Please fill in all required fields marked with *");
//         return;
//       }
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError("❌ Passwords do not match");
//       return;
//     }

//     try {
//       // 2. Add the dummy email to the payload being sent to the backend
//       const payload = { 
//         ...formData
//       };
//       delete payload.confirmPassword;

//       const res = await axios.post(
//         "https://ecochain-dashboard-backend.onrender.com/api/auth/register",
//         payload
//       );

//       if (res.data.success) {
//         setSuccess(true);
//         setTimeout(() => {
//           setSuccess(false);
//           handleClose();
//           openLogin();
//         }, 2000);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "❌ Registration failed");
//     }
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered size="lg">
//       <Modal.Header closeButton><Modal.Title className="fw-bold">Farmer Registration</Modal.Title></Modal.Header>
//       <Modal.Body>
//         <Form>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Full Name *</Form.Label>
//                 <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>
//                   NIC Number * {nicChecking && <small className="text-primary ms-2">Checking...</small>}
//                 </Form.Label>
//                 <Form.Control 
//                     name="nic" 
//                     value={formData.nic} 
//                     onChange={handleChange} 
//                     onBlur={handleNicBlur} 
//                     placeholder="e.g. 199212345678" 
//                     className={error && error.includes("NIC") ? "is-invalid" : ""}
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Province *</Form.Label>
//                 <Form.Select name="province" value={formData.province} onChange={handleChange}>
//                   <option value="">-- Select Province --</option>
//                   {Object.keys(locationData).map(p => <option key={p} value={p}>{p}</option>)}
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>District *</Form.Label>
//                 <Form.Select name="district" value={formData.district} onChange={handleChange} disabled={!formData.province}>
//                   <option value="">-- Select District --</option>
//                   {formData.province && locationData[formData.province].map(d => <option key={d} value={d}>{d}</option>)}
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Farmer Registration No *</Form.Label>
//                 <Form.Control name="farmerRegNo" value={formData.farmerRegNo} onChange={handleChange} placeholder="Reg Number" />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Mobile Number *</Form.Label>
//                 <Form.Control name="mobile" value={formData.mobile} onChange={handleChange} placeholder="07xxxxxxxx" />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Password *</Form.Label>
//                 <Form.Control name="password" type="password" value={formData.password} onChange={handleChange} />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Confirm Password *</Form.Label>
//                 <Form.Control name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
//               </Form.Group>
//             </Col>
//           </Row>

//           {error && <Alert variant="danger" className="py-2">{error}</Alert>}
//           {success && <Alert variant="success" className="py-2">✅ Registration successful! Redirecting to login...</Alert>}
//         </Form>
//       </Modal.Body>
//       <Modal.Footer className="border-0">
//         <Button variant="light" onClick={handleClose} className="px-4">Cancel</Button>
//         <Button variant="primary" onClick={handleRegister} disabled={nicChecking || !!error} className="px-5 fw-bold">
//           Register Account
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default RegisterModal;


import React, { useState } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";

// --- SRI LANKA GEOGRAPHIC DATA ---
const locationData = {
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Eastern": ["Ampara", "Batticaloa", "Trincomalee"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "North Western": ["Kurunegala", "Puttalam"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  "Sabaragamuwa": ["Kegalle", "Ratnapura"],
  "Southern": ["Galle", "Hambantota", "Matara"],
  "Uva": ["Badulla", "Moneragala"],
  "Western": ["Colombo", "Gampaha", "Kalutara"]
};

const RegisterModal = ({ show, handleClose, openLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    farmerRegNo: "",
    province: "",
    district: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [nicChecking, setNicChecking] = useState(false);

  // --- HANDLE INPUT CHANGES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error as soon as user starts typing to correct a mistake
    if (error) setError("");

    if (name === "province") {
      setFormData({ ...formData, province: value, district: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- NIC LOGICAL VALIDATION (Sri Lankan Rules) ---
  const validateNICLogic = (nic) => {
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/i;
    if (!nicRegex.test(nic)) return { valid: false, msg: "Invalid NIC format." };

    let dayOfYear;
    if (nic.length === 10) {
      dayOfYear = parseInt(nic.substring(2, 5));
    } else {
      dayOfYear = parseInt(nic.substring(4, 7));
    }

    const actualDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
    if (actualDay < 1 || actualDay > 366) return { valid: false, msg: "Invalid date encoded in NIC." };

    return { valid: true };
  };

  // --- BACKEND EXISTENCE CHECK ---
  const handleNicBlur = async () => {
    if (!formData.nic) {
        setError("");
        return;
    }
    
    // Clear previous error before starting new check
    setError(""); 

    const logicCheck = validateNICLogic(formData.nic);
    if (!logicCheck.valid) {
      setError(`❌ ${logicCheck.msg}`);
      return;
    }

    setNicChecking(true);
    try {
      // Get the backend URL from your local .env or Netlify Environment Variables
      const backendUrl = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${backendUrl}/api/auth/check-nic/${formData.nic}`);
      
      if (res.data.exists) {
        setError("❌ This NIC is already registered to another account.");
      }
    } catch (err) {
      console.error("NIC check failed");
    } finally {
      setNicChecking(false);
    }
  };

  // --- FINAL REGISTRATION ---
  const handleRegister = async () => {
    setError("");
    setSuccess(false);

    // Required field validation (No email here)
    const mandatory = ["fullName", "nic", "farmerRegNo", "province", "district", "mobile", "password", "confirmPassword"];
    for (let key of mandatory) {
      if (!formData[key]) {
        setError("❌ Please fill in all required fields marked with *");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }

    try {
      const payload = { 
        ...formData
      };
      delete payload.confirmPassword;

      // Get the backend URL from your local .env or Netlify Environment Variables
      const backendUrl = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${backendUrl}/api/auth/register`, payload);

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          handleClose();
          openLogin();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "❌ Registration failed");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton><Modal.Title className="fw-bold">Farmer Registration</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  NIC Number * {nicChecking && <small className="text-primary ms-2">Checking...</small>}
                </Form.Label>
                <Form.Control 
                    name="nic" 
                    value={formData.nic} 
                    onChange={handleChange} 
                    onBlur={handleNicBlur} 
                    placeholder="e.g. 199212345678" 
                    className={error && error.includes("NIC") ? "is-invalid" : ""}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Province *</Form.Label>
                <Form.Select name="province" value={formData.province} onChange={handleChange}>
                  <option value="">-- Select Province --</option>
                  {Object.keys(locationData).map(p => <option key={p} value={p}>{p}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>District *</Form.Label>
                <Form.Select name="district" value={formData.district} onChange={handleChange} disabled={!formData.province}>
                  <option value="">-- Select District --</option>
                  {formData.province && locationData[formData.province].map(d => <option key={d} value={d}>{d}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Farmer Registration No *</Form.Label>
                <Form.Control name="farmerRegNo" value={formData.farmerRegNo} onChange={handleChange} placeholder="Reg Number" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number *</Form.Label>
                <Form.Control name="mobile" value={formData.mobile} onChange={handleChange} placeholder="07xxxxxxxx" />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control name="password" type="password" value={formData.password} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password *</Form.Label>
                <Form.Control name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          {success && <Alert variant="success" className="py-2">✅ Registration successful! Redirecting to login...</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="light" onClick={handleClose} className="px-4">Cancel</Button>
        <Button variant="primary" onClick={handleRegister} disabled={nicChecking || !!error} className="px-5 fw-bold">
          Register Account
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RegisterModal;