import { Router } from "express";
import { createPost, getAllPosts, deletePost, getPostsByTag } from "../controllers/postController.js";
import { authenticateToken } from "../middleware/auth.js";
import { createComment, deleteComment } from "../controllers/commentController.js";

const router = Router();

router.post("/", authenticateToken, createPost);
router.get("/", getAllPosts);

router.get("/tag/:tagName", getPostsByTag);

router.delete("/:id", authenticateToken, deletePost);

router.post("/:postId/comments", authenticateToken, createComment);

router.delete("/:postId/comments/:commentId", authenticateToken, deleteComment);

export default router;