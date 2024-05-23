const generateToken = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbid");
const generateRefreshToken = require("../config/refreshToken");
const bcrypt = require('bcrypt')

const createUser = asyncHandler(async (req, res) => {
    try {
        const loginId = req.body.loginId; // Change email to loginId
        const findUser = await User.findOne({ loginId: loginId }); // Change email to loginId

        if (!findUser) {
            const newUser = await User.create(req.body);
            res.status(200).json({ success: true, code: 200, user: newUser }); // Added success flag and user object
        } else {
            res.status(400).json({ success: false, code: 400, message: 'User with this loginId already exists' }); // Added success flag and error message
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, code: 500, message: 'Internal Server Error' }); // Added success flag and error message
    }
});

const createAdmin = asyncHandler(async (req, res) => {
    try {
        const loginId = req.body.loginId; // Change email to loginId
        const findUser = await User.findOne({ loginId: loginId });

        if (!findUser) {
            const newUser = await User.create({ ...req.body, role: 'admin' });
            res.status(201).json({ success: true, user: newUser });
        } else {
            res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
    } catch (error) {
        console.error('Error creating superadmin:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

const checkActiveStatus = async (req, res, next) => {
    try {
        const user = await User.findOne({ loginId: req.body.loginId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.isactive) {
            return res.status(403).json({ message: 'User is not active' });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Login a user
const loginUser = asyncHandler(async (req, res) => {
    const { loginId, password } = req.body;

    try {
        // Check if user exists
        const findUser = await User.findOne({ loginId });

        // If user is not found
        if (!findUser) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Invalid credentials",
            });
        }

        // Check if passwords match
        if (findUser.password !== password) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Invalid credentials",
            });
        }

        // If passwords match, generate refresh token
        const refreshToken = await generateRefreshToken(findUser._id);

        // Update refresh token in the database
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            { refreshToken: refreshToken },
            { new: true }
        );

        // Set refresh token in cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        // Send success response with user data and access token
        res.json({
            success: true,
            code: 200,
            data: {
                _id: findUser._id,
                firstname: findUser.firstname,
                loginId: findUser.loginId,
                qualityupdate: findUser.qualityupdate,
                qrprint: findUser.qrprint,
                salesorder: findUser.salesorder,
                stockupdate: findUser.stockupdate,
                role: findUser.role,
                token: generateToken(findUser._id),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error",
        });
    }
});

const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Update the user by ID
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, code: 404, message: "User not found" });
        }

        // Success response with updated user
        return res.status(200).json({ success: true, updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ success: false, code: 500, message: "Internal server error" });
    }
})

const updateUserActive = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { isactive } = req.body;

    try {
        // Find the user by userId
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the isactive field
        user.isactive = isactive;

        // Save the updated user
        await user.save();

        res.json({ message: 'isactive field updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const getUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id; // Extract id from request parameters
        const user = await User.findById(id); // Find the user by _id

        if (!user) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "User not found",
            });
        }

        // If user found, send user data as response
        res.status(200).json({
            success: true,
            code: 200,
            user: user,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error",
        });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id; // Extract id from request parameters
        const user = await User.findById(id); // Find the user by _id

        if (!user) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "User not found",
            });
        }

        // If user found, delete user from the database
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            code: 200,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal server error",
        });
    }
});

const getAllUser = asyncHandler(async (req, res) => {
    try {
        // Fetch users with role "user" from the database
        const users = await User.find({ role: 'user' });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = { createUser, createAdmin, checkActiveStatus, loginUser, updateUser, updateUserActive, getUser, deleteUser, getAllUser }