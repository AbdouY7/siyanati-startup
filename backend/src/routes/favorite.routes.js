const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require("../controllers/favorite.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:target_id/:target_type", removeFavorite);
router.get("/:target_id/:target_type/check", checkFavorite);

module.exports = router;
