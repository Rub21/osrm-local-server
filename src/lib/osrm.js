const os = require("os");

process.env.UV_THREADPOOL_SIZE = Math.ceil(os.cpus().length * 1.5);

const OSRM = require("osrm");

function loadGraph(options) {
  return new OSRM(options.osrmDataPath);
}

module.exports = {
  loadGraph
};
