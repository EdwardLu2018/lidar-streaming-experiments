# Lidar Streaming Test Repo

## How to use:
### Running the broker (TODO: eventually use a public MQTT broker)
```
cd server
sh run_mqtt.sh      # start mqtt broker
```

### Running the server
```
cd server
python3 server.py   # start python server (as of now, just switches between two point clouds)
```

### Running the client
```
cd client
npm run build       # build with parcel
npm run serve       # serve client webpage
```
Open [localhost:8000](localhost:8000)
