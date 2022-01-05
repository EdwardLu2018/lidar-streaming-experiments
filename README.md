# Lidar Streaming Test Repo

## How to use:
### Running the server
```
cd server
sh run_mqtt.sh      # start mqtt broker
python3 server.py   # start python server (as of now, just switches between two point clouds)
```

### Running the client
```
cd client
npm run build       # build with parcel
npm run serve       # serve client webpage
```
Open [localhost:8000](localhost:8000)
