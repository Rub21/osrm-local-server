# OSRM local server


## Setup  OSRM containers


`docker build -t osmium-tool -f Dockerfile.osmium-tool .`
`docker pull osrm/osrm-backend:v5.16.4`


## Data preprocessing


`mkdir data`

Download the data fom OSM and save it as tr.osm file.





## Create a routable graph


```

docker run -it -v $(pwd)/data:/data osrm/osrm-backend:v5.16.4 osrm-extract -p /opt/car.lua /data/tr.osm
docker run -it -v $(pwd)/data:/data osrm/osrm-backend:v5.16.4 osrm-contract /data/tr.osrm


```




Improvements from : [osrm-express-server-demo](https://github.com/door2door-io/osrm-express-server-demo)

### Requerimentes

`export OSRM_GRAPH=./data/tr.osrm`

## Run

```
npm start

```