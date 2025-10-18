import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostController } from "./post.controller";

const postRouter = Router();

// yeni post oluşturma route'u
postRouter.post('/', authMiddleware, createPostController);

export default postRouter;