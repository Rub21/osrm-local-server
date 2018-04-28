const express = require("express");
const logfmt = require("logfmt");
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const exec = require('executive');

const router = express.Router();
//Only admin can req this endpoint
router.get("/", (req, res) => {
  const ways = getWays(req);
  ignoreSegment(ways, './data', function(error, resp) {
    if (error) return res.json({
      error: 'error processing the data'
    });
    return res.json({
      resp,
      ways
    });
  });
});


function createSpeedProfile(speedProfileFile, ways) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(speedProfileFile);
    file
      .on('open', () => {
        // Compute traffic profile.
        // https://github.com/Project-OSRM/osrm-backend/wiki/Traffic
        for (var k = 0; k < ways.length; k++) {
          let way = ways[k]
          if (k !== 0) {
            file.write('\n');
          }
          for (let i = 0; i < way.nodes.length - 2; i++) {
            const node = way.nodes[i];
            const nextNode = way.nodes[i + 1];
            file.write(`${node},${nextNode},0\n`);
            if (i + 3 === way.nodes.length) {
              file.write(`${nextNode},${node},0`);
            } else {
              file.write(`${nextNode},${node},0\n`);
            }
          }
        }
        file.end();
      })
      .on('error', err => reject(err))
      .on('finish', () => resolve());
  });
}

function ignoreSegment(ways, osrmFolder, cb) {
  const identifier = ways.id;
  const speedProfileFile = `data/speed.csv`;
  const rootPath = path.resolve(__dirname, '../../');
  // The dockerVolMount depends on whether we're running this from another docker
  const dockerVolMount = rootPath;
  // Paths for the files depending from where this is being run.
  const pathSpeedProf = speedProfileFile;
  createSpeedProfile(speedProfileFile, ways)
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
        '--segment-speed-file', 
        '/data/speed.csv',
        '--core 0.8',
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


function getWays(req) {
  // https://www.openstreetmap.org/way/448220597#map=19/-8.11742/-79.01687&layers=D
  // https://www.openstreetmap.org/way/90564392#map=17/-8.10327/-79.01803&layers=D
  var way1 = {
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

  var way2 = {
    id: 448220597,
    nodes: [
      4452550922,
      4452550920,
      1051000208,
      1026647093,
      316265136,
      4706097947,
      316265135,
      316265134,
      316265133,
      316265132,
      5086618919,
      1026647572,
      316265131,
      316265129,
      1026647527,
      316265126,
      316265124,
      1098627620,
      316265122,
      1088227255,
      1098594792,
      1098634071,
      1026647227,
      1026646809,
      316265120,
      1088227326,
      1098633802,
      316265119,
      316265118,
      1015347808,
      1015292423,
      1098595328,
      316488151,
      316265117,
      1098617316,
      316265116,
      1098612124,
      1098632182,
      2604839551,
      1098589459,
      320114996,
      1098613378,
      1098594789,
      3670684735,
      1088227350,
      3670684731
    ]
  };

  return [way1, way2];
}

module.exports = router;