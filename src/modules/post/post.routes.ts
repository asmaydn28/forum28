import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostController, gettAllPostController, getPostByIdController, deletePostController } from "./post.controller";

import * as postController from './post.controller';


const postRouter = Router();

// yeni post oluşturma route'u
postRouter.post('/', authMiddleware, createPostController);

// post listeleme route'u
postRouter.get('/', gettAllPostController);

// id'ye göre post getirme route'u
postRouter.get('/:id', getPostByIdController);

// post güncelleme route 'u
postRouter.patch('/:postId', authMiddleware, postController.updatePostController);

// post silme route 'u
postRouter.delete('/:postId', authMiddleware, postController.deletePostController);

export default postRouter;