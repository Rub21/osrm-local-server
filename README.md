# OSRM local server

## Setup  OSRM containers

```
docker build -t osmium-tool -f Dockerfile.osmium-tool .
docker pull osrm/osrm-backend:v5.16.4
```


## Data preprocessing

```
mkdir data/
wget https://www.dropbox.com/s/ecefm53ykenwd3n/tr.osm  -O data/tr.osm
docker run -it -v $(pwd)/data:/data osrm/osrm-backend:v5.16.4 osrm-extract -p /opt/car.lua /data/tr.osm
docker run -it -v $(pwd)/data:/data osrm/osrm-backend:v5.16.4 osrm-contract /data/tr.osrm

```

### Requerimentes

`export OSRM_GRAPH=./data/tr.osrm`

## Run

```
npm start

```