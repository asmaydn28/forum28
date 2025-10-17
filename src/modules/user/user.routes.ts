import { Router } from "express";
import { createUserController, getAllUsersController } from "./user.controller";

const router = Router();

// yeni kullanıcı oluşturma route'u
router.post('/', createUserController);

// tüm kullanıcıları getirme route'u
router.get('/', getAllUsersController);

export default router;