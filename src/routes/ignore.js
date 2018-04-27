const express = require("express");
const logfmt = require("logfmt");
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const exec = require('executive');

const router = express.Router();

router.get("/", (req, res) => {
  // https://www.openstreetmap.org/way/448220597#map=19/-8.11742/-79.01687&layers=D
  // https://www.openstreetmap.org/way/90564392#map=17/-8.10327/-79.01803&layers=D
  var way = {
    id: 90564392,
    nodes: [4452550921,
      4452550922,
      1098601537,
      1051000245,
      5483345195,
      1098620120,
      1088227476,
      1098585235,
      1098641105,
      1098641400,
      1088227388,
      1098647854,
      1098635414,
      1098584127,
      1098639238,
      1098633083,
      1098622426,
      5478475745,
      5476546741,
      2573525834
    ]
  };
  ignoreSegment(way, './data', function(error, res) {
    if (error) return res.json({
      error: 'error processing the data'
    });
    return res.json(way);
  });
});


function createSpeedProfile(speedProfileFile, way) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(speedProfileFile);
    file
      .on('open', () => {
        // Compute traffic profile.
        // https://github.com/Project-OSRM/osrm-backend/wiki/Traffic
        for (let i = 0; i < way.nodes.length - 2; i++) {
          if (i !== 0) {
            file.write('\n');
          }
          const node = way.nodes[i];
          const nextNode = way.nodes[i + 1];
          file.write(`${node},${nextNode},0\n`);
          file.write(`${nextNode},${node},0`);
        }
        file.end();
      })
      .on('error', err => reject(err))
      .on('finish', () => resolve());
  });
}

function ignoreSegment(way, osrmFolder, cb) {
  const identifier = way.id;
  const speedProfileFile = `data/speed-${identifier}.csv`;
  const rootPath = path.resolve(__dirname, '../../');
  // The dockerVolMount depends on whether we're running this from another docker
  const dockerVolMount = rootPath;
  // Paths for the files depending from where this is being run.
  const pathSpeedProf = speedProfileFile;
  createSpeedProfile(speedProfileFile, way)
    .then(function() {
      const command = [
        'docker',
        'run',
        '--rm',
        '-t',
        '-v',
        `${dockerVolMount}/data:/data`,
        'osrm/osrm-backend:v5.16.4',
        'osrm-contract',
        '--segment-speed-file', '/' + pathSpeedProf,
        `/data/tr.osrm`
      ];
      console.log(command.join(' '));
      exec(command.join(' '), (error, stdout, stderr) => {
        if (error) {
          console.log(error)
        } else {
          cb(null, 'ok')
        }
      });
    }).catch(function(error) {
      cb(error, null)
    });
}

module.exports = router;