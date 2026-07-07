import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./User.js";

const router = express.Router();

// ✅ CHECK NIC (Real-time)
router.get("/check-nic/:nic", async (req, res) => {
  try {
    const existingUser = await User.findOne({ nic: req.params.nic });
    res.json({ exists: !!existingUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error checking NIC" });
  }
});

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, nic, farmerRegNo, province, district, mobile, password } = req.body;

    // 1. Check mandatory fields 
    if (!fullName || !nic || !farmerRegNo || !province || !district || !mobile || !password) {
      return res.status(400).json({ success: false, message: "Please fill all required fields (*)" });
    }

    // 2. Uniqueness checks
    const existingNIC = await User.findOne({ nic });
    if (existingNIC) return res.status(400).json({ success: false, message: "NIC already registered" });

    const existingFarmer = await User.findOne({ farmerRegNo });
    if (existingFarmer) return res.status(400).json({ success: false, message: "Farmer Reg No already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      nic,
      farmerRegNo,
      province,
      district,
      mobile,
      password: hashedPassword,
      role: "farmer",
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "Registration successful" });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Database error: " + err.message });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    // 1. Look for farmerRegNo instead of nic
    const { farmerRegNo, password } = req.body;

    if (!farmerRegNo || !password) {
      return res.status(400).json({ success: false, message: "Please provide both Farmer ID and password." });
    }

    // 2. Find user by farmerRegNo
    const user = await User.findOne({ farmerRegNo });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Farmer ID or password." });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Farmer ID or password." });
    }

    // 4. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role, farmerRegNo: user.farmerRegNo },
      process.env.JWT_SECRET || "your_temporary_secret_key", 
      { expiresIn: "1d" }
    );

    // 5. Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        farmerRegNo: user.farmerRegNo,
        role: user.role,
        province: user.province,
        district: user.district
      }
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});
export default router;