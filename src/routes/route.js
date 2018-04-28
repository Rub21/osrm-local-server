const express = require("express");
const logfmt = require("logfmt");

const router = express.Router();

router.get("/", (req, res) => {
  if (!req.query.coordinates) {
    return res.status(422).json({
      error: "Missing coordinates"
    });
  }
  const osrm = req.app.get("osrm");
  const coordinates = [req.query.coordinates.split(";")[0].split(",").map(Number), req.query.coordinates.split(";")[1].split(",").map(Number)];
  const options = {
    coordinates: coordinates,
    alternatives: true,
    steps: true,
    annotations: true,
    geometries: req.query.geometries || "polyline",
    overview: req.query.overview || "false",
    continue_straight: req.query.continue_straight || false
  };

  try {
    osrm.route(options, (err, result) => {
      if (err) {
        return res.status(422).json({
          error: err.message
        });
      }
      return res.json(result);
    });
  } catch (err) {
    logfmt.error(new Error(err.message));
    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;