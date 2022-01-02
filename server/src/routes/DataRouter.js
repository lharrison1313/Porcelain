const { Router } = require("express");
const { buildOverviewData, buildIPMapData, buildSessionData } = require("../services/CowrieDataService");
const router = new Router();

router.get("/overview/:days", async (req, res) => {
  buildOverviewData(req, res);
});

router.get("/sessions/:days", (req, res) => {
  buildSessionData(req, res);
});

router.get("/ipmap/:days", (req, res) => {
  buildIPMapData(req, res);
});

module.exports = router;
