import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostController, gettAllPostController, getPostByIdController } from "./post.controller";

const postRouter = Router();

// yeni post oluşturma route'u
postRouter.post('/', authMiddleware, createPostController);

// post listeleme route'u
postRouter.get('/', gettAllPostController);

// id'ye göre post getirme route'u
postRouter.get('/:id', getPostByIdController);

export default postRouter;