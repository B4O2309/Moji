import express from "express";
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getAllFriends, getFriendRequests, unfriend} from "../controllers/friendController.js";

const router = express.Router();

// Send a friend request
router.post("/requests", sendFriendRequest);

router.post("/requests/:requestId/accept", acceptFriendRequest);

router.post("/requests/:requestId/decline", declineFriendRequest);

router.get("/", getAllFriends);

router.get("/requests", getFriendRequests);

router.delete("/:friendId", unfriend);

export default router;