# OSRM local server

## SEstablecer servidor

```
docker build -t osmium-tool -f Dockerfile.osmium-tool .
docker pull osrm/osrm-backend:v5.16.4
```


## Procesamiento de datos

```
mkdir data/
wget https://www.dropbox.com/s/ecefm53ykenwd3n/tr.osm  -O data/tr.osm
docker run -it -v $(pwd)/data:/data osrm/osrm-backend:v5.16.4 osrm-extract -p /opt/car.lua /data/tr.osm
docker run -it -v $(pwd)/data:/data osrm/osrm-backend:v5.16.4 osrm-contract /data/tr.osrm

```

### Requerimientos

`export OSRM_GRAPH=./data/tr.osrm`

## Ejecutar

```
npm start

```

#### OSRM algorithm

https://en.wikipedia.org/wiki/Contraction_hierarchies


#### GIF

![ezgif-2-668993f909](https://user-images.githubusercontent.com/1152236/39410955-0ef70652-4bc6-11e8-9534-3da26b9b7bda.gif)
