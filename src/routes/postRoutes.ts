import { Router } from "express";
import { createPost, getAllPosts, deletePost } from "../controllers/postController.js";
import { authenticateToken } from "../middleware/auth.js";
import { createComment, deleteComment } from "../controllers/commentController.js";

const router = Router();

router.post("/", authenticateToken, createPost);
router.get("/", getAllPosts);
router.delete("/:id", authenticateToken, deletePost);

// Bir posta yorum ekleme
router.post("/:postId/comments", authenticateToken, createComment);

// Bir posttaki yorumu silme
router.delete("/:postId/comments/:commentId", authenticateToken, deleteComment);

export default router;
