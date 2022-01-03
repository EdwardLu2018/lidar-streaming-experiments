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
        while self.running:
            for filename in os.listdir(data_dir):
                image = cv2.imread(data_dir + "/" + filename)
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

                chunk = np.copy(image.reshape(-1,))
                it = 0
                for i in range(image.shape[0]):
                    for j in range(image.shape[1]):
                        chunk[it] = image[i][j][0]
                        it = it + 1
                        chunk[it] = image[i][j][1]
                        it = it + 1
                        chunk[it] = image[i][j][2]
                        it = it + 1

                print("Sending", chunk.size, "bytes to", self.topic, image.shape)
                # chunk = base64.b64encode(chunk)
                self.client.publish(self.topic, payload=bytearray(chunk))
                time.sleep(1)

stream = None

def on_connect(client, userdata, flags, rc):
    client.subscribe("client/#")
    print("Connected!")

def on_message(client, userdata, msg):
    try:
        _on_message(client, userdata, msg)
    except:
        print(traceback.format_exc())

def _on_message(client, userdata, msg):
    global stream

    print(msg.topic, ":", str(msg.payload))

    if msg.topic == "client/describe":
        req = json.loads(msg.payload.decode())
        reply = {
            "mimeCodec": 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
            "error": ""
        }

        print("Sending reply", req['resp_topic'])
        client.publish(req['resp_topic'], payload=json.dumps(reply))

    elif msg.topic == "client/play":
        req = json.loads(msg.payload.decode())

        if stream is not None:
            stream.stop()
        stream = LidarStream(client, req['resp_topic'])
        stream.start()

    elif msg.topic == "client/stop":
        req = json.loads(msg.payload.decode())

        stream.stop()

client = mqtt.Client("server0", clean_session=True, transport="websockets")
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", port=9001, keepalive=60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()
