import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostController, gettAllPostController } from "./post.controller";

const postRouter = Router();

// yeni post oluşturma route'u
postRouter.post('/', authMiddleware, createPostController);

// post listeleme route'u
postRouter.get('/', gettAllPostController);

export default postRouter;