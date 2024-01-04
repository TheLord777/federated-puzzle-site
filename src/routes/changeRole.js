const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// PATCH to edit user role
// requires { user_id: <user_id>, role: <role> } to be sent
router.patch("/", async (req, res) => {
    console.log("PATCH request recieved to /api/changeRole");

    // Ensures JWT is valid
    if(!(req.auth.displayName && req.auth.groupID && req.auth.userID)){
        console.log("Invalid JWT");
        res.status(400).send({message: "Invalid JWT - no displayName/groupID"});
        return;
    }

    if (!req.body.role) {
        console.log("No updated role");
        res.status(400).send({message: "Must give updated role"});
        return;
    }

    // Check if user is admin, and whether the changing user is also an admin
    let role = await db.getRole(req.auth.userID);
    let changingRole = await db.getRole(req.body.user_id);

    // Cannot change anyones role if not an admin
    if (role != "administrator") {
        console.log("Unauthorised to change another users role");
        res.status(401).send({message: "User not authorised to update another user's role"});
        return;
    }

    // Admins cannot change other users roles
    if (changingRole == "administrator") {
        console.log("Unathorised to update another admins role");
        res.status(401).send({message: "User not authorised to update an admins role"});
        return;
    }

    let updated = await db.changeRole(req.body.user_id, req.body.role);
    if (updated) {
        console.log("Role Updated");
        res.status(200).send({message: "Role updated", role: req.body.role});
        return;
    } else {
        console.log("Database Error");
        res.status(500).send({message: "Could not change user to given role"});
    }
    return;
});

module.exports = router;