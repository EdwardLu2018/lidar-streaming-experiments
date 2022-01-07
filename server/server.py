#!/usr/bin/env python3

import os
import time
import json
import threading
import traceback
import base64

import cv2
import numpy as np
import paho.mqtt.client as mqtt

class LidarStream(threading.Thread):
    def __init__(self, client, topic):
        threading.Thread.__init__(self)
        self.daemon = True
        self.client = client
        self.topic = topic
        self.running = True

    def stop(self):
        self.running = False

    def run(self):
        data_dir = 'data'
        images = []
        for filename in os.listdir(data_dir):
            image = cv2.imread(data_dir + "/" + filename)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            resized = np.copy(image.reshape(-1,))
            idx = 0
            for i in range(image.shape[0]):
                for j in range(image.shape[1]):
                    resized[idx] = image[i][j][0]
                    idx = idx + 1
                    resized[idx] = image[i][j][1]
                    idx = idx + 1
                    resized[idx] = image[i][j][2]
                    idx = idx + 1

            images += [resized]

        while self.running:
            for image in images:
                print("Sending", image.size, "bytes to", self.topic, time.time())
                # image = base64.b64encode(image)
                self.client.publish(self.topic, payload=bytearray(image))
                time.sleep(1)

stream = None

def on_connect(client, userdata, flags, rc):
    client.subscribe("lidartest/client/#")
    print("Connected!")

def on_message(client, userdata, msg):
    try:
        _on_message(client, userdata, msg)
    except:
        print(traceback.format_exc())

def _on_message(client, userdata, msg):
    global stream

    print(msg.topic, ":", str(msg.payload))

    if msg.topic == "lidartest/client/describe":
        req = json.loads(msg.payload.decode())
        reply = {
            "mimeCodec": "custom rgbd codec",
            "error": ""
        }

        print("Sending reply", req['resp_topic'])
        client.publish(req['resp_topic'], payload=json.dumps(reply))

    elif msg.topic == "lidartest/client/play":
        req = json.loads(msg.payload.decode())

        if stream is None:
            stream = LidarStream(client, "lidartest/stream")
            stream.start()

    elif msg.topic == "lidartest/client/stop":
        req = json.loads(msg.payload.decode())

        stream.stop()

hostname = "arenaxr.org"
username = "cli"
password = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGkiLCJzdWJzIjpbIiMiXSwicHVibCI6WyIjIl0sImlhdCI6MTYzMTU1MjY0OSwiZXhwIjoxNjYzMDg4NjQ5fQ.epRhjujjMjolLR6-dEGlF109BedpuAg_1y81HLZ6ZeNnIx8AawCadlxhmJV79TS30fqaTHzuGUzuKzzifTChouqwZTn6Nrb96iObEIIfp0KYpxnL1rnOx3qu1QTdQ9p2cffwuBo8YhS5my5NozW34VAJsRk1y2VwPW0oj4sk4kn198m3GIetI86-wrk92-e2LdzXVh5b5pAPvOdh5p0WrMLt-xO4rpi_xX_Zxjd1Z6C6gnRAG-Nc0UelYIHgkBIn_VdeEdyRvHDOQVhL07w8WpqonpinT37RTNbk5dsal-3H1AjHrd1DIAWRffvEYtOrKInsYyDgpxOciEv6Hx3zKp3ekskRTo2GfUH03EFiJy9vjrhHhF7oSaNxp5nl7EB1wBQxVeg6bgobhX6xUrG_8GuSxX6dXZCCt0pujwj9KZb_4y5KBfYCDpf2pd0uYvZ3WimXGwd_S9XgRu6vVdIWs65B_alIMWfhgxLcw-2FM33JFXx3_eGCiBu0XrbM6pdB86rx1VYiWgFFrvaMhNZfOqxup5w7QMRhY9eWTub7iUr5NYKhCnVkZx9i8V0uFZFasSgy4bhLqLdmZBWnMMHuoCUMYLfTw0RHHBpt010Q2k5JB-2l_qeRz1IJ0sMc91R69Cvm6LLBjIy4AYwCAc7NWxKNAbYI7PEwUAMjylMGJrc"

client = mqtt.Client("server0", clean_session=True)
client.on_connect = on_connect
client.on_message = on_message

client.tls_set()
client.username_pw_set(username=username, password=password)
client.connect(hostname, port=8883, keepalive=60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()
