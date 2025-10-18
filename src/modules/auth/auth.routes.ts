import { Router } from "express";
import { loginController, logoutController } from "./auth.controller";

const router = Router();

router.post('/login', loginController); // giris yolu
router.post('/logout', logoutController); // cikis yolu

export default router;