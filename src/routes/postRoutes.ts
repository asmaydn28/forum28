import { Router } from "express";
import { createPost, getAllPosts, deletePost } from "../controllers/postController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, createPost);
router.get("/", getAllPosts);
router.delete("/:id", authenticateToken, deletePost);

export default router;
