const parser = require('xml2json');
const request = require('request');
const fs = require("fs");

module.exports = {};
module.exports.rq = (url, callback) => {
    request(url, (error, response, body) => {
        if (error) {
            callback({});
        } else {
            callback(JSON.parse(parser.toJson(body)));
        }
    });
};

module.exports.jsonbody = (json) => {
    if (json.osm.way) {
        var way = {
            type: 'way',
            id: json.osm.way.id,
            user: json.osm.way.user,
            uid: json.osm.way.uid,
            nodes: [],
            tags: {}
        };
        json.osm.way.nd.forEach((element) => {
            way.nodes.push(element.ref);
        });
        json.osm.way.tag.forEach((element) => {
            way.tags[element.k] = element.v;
        });
        return way;
    }
    if (json.osm.node) {
        var node = {
            type: 'node',
            id: json.osm.node.id,
            user: json.osm.node.user,
            uid: json.osm.node.uid,
            lat: json.osm.node.lat,
            lon: json.osm.node.lon,
            tags: {}
        };
        json.osm.node.tag.forEach((element) => {
            node.tags[element.k] = element.v;
        });
        return node;
    }
    return json.osm;
};

module.exports.getInfo = (url, callback) => {
    module.exports.rq(url, (json) => {
        callback(module.exports.jsonbody(json));
    });
};

module.exports.write = (file_name, data) => {
    fs.writeFileSync(file_name + '.json', JSON.stringify(data));
};