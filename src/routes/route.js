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
  console.log(req.query);
  const coordinates = [req.query.coordinates.split(";")[0].split(",").map(Number), req.query.coordinates.split(";")[1].split(",").map(Number)];
  const options = {
    coordinates: coordinates,
    // alternatives: req.query.alternatives || false,
    alternatives: true,
    // Return route steps for each route leg
    // steps: req.query.steps || false,
    steps: true,
    // Return annotations for each route leg
    // annotations: req.query.annotations || false,
    annotations: true,
    // Returned route geometry format. Can also be geojson
    geometries: req.query.geometries || "polyline",
    // Add overview geometry either full, simplified according to
    // highest zoom level it could be display on, or not at all
    overview: req.query.overview || "false",
    // Forces the route to keep going straight at waypoints and don't do
    // a uturn even if it would be faster. Default value depends on the profile
    continue_straight: req.query.continue_straight || false
  };

  try {
    osrm.route(options, (err, result) => {
      if (err) {
        return res.status(422).json({
          error: err.message
        });
      }
      console.log(result);
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