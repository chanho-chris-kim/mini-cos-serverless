import { Router } from "express";
import { AuthService } from "../../domain/auth/auth.service";
import { requireAuth, RequestWithUser } from "../../middleware/auth.middleware";

const router = Router();
const auth = new AuthService();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await auth.login(email, password);
    return res.json(result);
  } catch {
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

// NEW: return current user based on token
router.get("/me", requireAuth, (req: RequestWithUser, res) => {
  return res.json({ user: req.user });
});

export default router;
