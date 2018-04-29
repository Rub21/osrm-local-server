const express = require("express");
const logfmt = require("logfmt");
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const exec = require('executive');
const osmInfo = require('./../helpers/osmInfo');
const csvProfilePath = './data';

const router = express.Router();
/**
 * Only admin can req this endpoint
  example: 
  body={
    "ways":[448220597,90564392]
  }
 */
router.post("/", (req, res) => {
  req.body.ways = req.body.ways.map(Number);
  console.log(req.body.ways);
  getWays(req, function(ways) {
    ignoreSegment(ways, csvProfilePath, function(error, resp) {
      if (error) return res.json({
        error: 'error processing the data'
      });
      return res.json({
        resp,
        ways
      });
    });
  });
});

function createSpeedProfile(speedProfileFile, ways) {
  //to return back, we need to check here
  var segments = [];
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(speedProfileFile);
    file
      .on('open', () => {
        // Compute traffic profile.
        // https://github.com/Project-OSRM/osrm-backend/wiki/Traffic
        for (var k = 0; k < ways.length; k++) {
          let way = ways[k]
          for (let i = 0; i < way.nodes.length - 2; i++) {
            const node = way.nodes[i];
            const nextNode = way.nodes[i + 1];
            segments.push(`${node},${nextNode},0`);
            segments.push(`${nextNode},${node},0`);
          }
        }
        file.write(segments.join('\n'));
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


function getWays(req, cb) {
  // https://www.openstreetmap.org/way/448220597#map=19/-8.11742/-79.01687&layers=D
  // https://www.openstreetmap.org/way/90564392#map=17/-8.10327/-79.01803&layers=D
  var ways = [];
  var waysIds = req.body.ways;
  var index = 0;
  findWay(waysIds[index]);

  function findWay(wayId) {
    var url = 'https://www.openstreetmap.org/api/0.6/way/' + wayId;
    console.log(url)
    osmInfo.getInfo(url, (data) => {
      if ((index + 1) < waysIds.length) {
        ways.push(data);
        index++;
        findWay(waysIds[index]);
      } else {
        ways.push(data);
        cb(ways);
      }
    });
  }
}

module.exports = router;