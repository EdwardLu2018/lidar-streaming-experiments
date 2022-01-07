import * as Paho from 'paho-mqtt';

export class MQTTStreamedVideoSource {
    constructor(hostname, handler) {
        // error numbers
        this.NOERROR = 0;
        this.WEBSOCKET_FAILURE = -1;
        this.CODEC_NOT_SUPPORTED = -2;

        this.TOPICS = {
            UNREGISTER: "lidartest/client/unregister",
            REGISTER: "lidartest/client/register",
            DESCRIBE: "lidartest/client/describe",
            PLAY: "lidartest/client/play",
            STOP: "lidartest/client/stop"
        };

        this.mqtt_handlers = {};
        this.data_handler = null;

        this.hostURI = 'wss://' + hostname;
        console.log("Connecting to", this.hostURI);
        this.clientId = "client" + parseInt(Math.random());
        this.client = new Paho.Client(this.hostURI, this.clientId);

        this.handler = handler;

        let _this = this;
        this.client.onConnectionLost = function (responseObject) {
            console.log(responseObject);
            _this.handler({
                error: "web socket failure",
                errnum: _this.WEBSOCKET_FAILURE
            });
        };

        this.client.onMessageArrived = function (message) {
            _this._onMqttMessage(message);
        };

        var userName = "cli"
        var password = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGkiLCJzdWJzIjpbIiMiXSwicHVibCI6WyIjIl0sImlhdCI6MTYzMTU1MjY0OSwiZXhwIjoxNjYzMDg4NjQ5fQ.epRhjujjMjolLR6-dEGlF109BedpuAg_1y81HLZ6ZeNnIx8AawCadlxhmJV79TS30fqaTHzuGUzuKzzifTChouqwZTn6Nrb96iObEIIfp0KYpxnL1rnOx3qu1QTdQ9p2cffwuBo8YhS5my5NozW34VAJsRk1y2VwPW0oj4sk4kn198m3GIetI86-wrk92-e2LdzXVh5b5pAPvOdh5p0WrMLt-xO4rpi_xX_Zxjd1Z6C6gnRAG-Nc0UelYIHgkBIn_VdeEdyRvHDOQVhL07w8WpqonpinT37RTNbk5dsal-3H1AjHrd1DIAWRffvEYtOrKInsYyDgpxOciEv6Hx3zKp3ekskRTo2GfUH03EFiJy9vjrhHhF7oSaNxp5nl7EB1wBQxVeg6bgobhX6xUrG_8GuSxX6dXZCCt0pujwj9KZb_4y5KBfYCDpf2pd0uYvZ3WimXGwd_S9XgRu6vVdIWs65B_alIMWfhgxLcw-2FM33JFXx3_eGCiBu0XrbM6pdB86rx1VYiWgFFrvaMhNZfOqxup5w7QMRhY9eWTub7iUr5NYKhCnVkZx9i8V0uFZFasSgy4bhLqLdmZBWnMMHuoCUMYLfTw0RHHBpt010Q2k5JB-2l_qeRz1IJ0sMc91R69Cvm6LLBjIy4AYwCAc7NWxKNAbYI7PEwUAMjylMGJrc"

        // last will message sent on disconnect
        var willmsg = new Paho.Message(JSON.stringify({
            clientId: _this.clientId
        }));
        willmsg.qos = 2;
        willmsg.destinationName = this.TOPICS.UNREGISTER;
        willmsg.retained = true;

        var options = {
            timeout: 3,
            userName : userName,
	        password : password,
            onSuccess: function () {
                _this._onMqttConnected();
            },
            onFailure: function (message) {
                _this.handler({
                    error: "web socket failure",
                    errnum: _this.WEBSOCKET_FAILURE
                });
            },
            willMessage: willmsg
        };

        this.client.connect(options);
    }

    _publish(topic, msg) {
        var message = new Paho.Message(JSON.stringify(msg));
        message.destinationName = topic;
        this.client.send(message);
    }

    _register_cb(topic, cb) {
        console.log("registering callback for " + topic );
        this.mqtt_handlers[topic] = cb;
        this.client.subscribe(topic);
    }

    _unregister_cb(topic) {
        delete this.mqtt_handlers[topic];
        this.client.unsubscribe(topic);
    }

    _onMqttConnected() {
        var resp_topic = "lidartest/client/describe/response_" + parseInt(Math.random() * 1000000000);

        this._register_cb(resp_topic, this._onDescribe.bind(this));

        let _this = this;
        this._publish(this.TOPICS.DESCRIBE, {
            clientId: _this.clientId,
            resp_topic: resp_topic
        });
    }

    _onMqttMessage(message) {
        var topic = message.destinationName;
        var func = this.mqtt_handlers[topic];
        if ( typeof func !== 'undefined' ) {
            var persist = func(message);
            if (!persist) {
                this._unregister_cb(topic);
            }
        }
    }

    _onDescribe(message) {
        let _this = this;
        var jobj = JSON.parse(message.payloadString);
        var mimeCodec = jobj['mimeCodec'];
        console.log(mimeCodec);

        var video_topic = "video_" + parseInt(Math.random() * 1000000000);
        this._register_cb(video_topic, function( message ) {
            // console.log( message.payloadBytes );
            if (_this.data_handler) {
                _this.data_handler(message.payloadBytes);
            }
            return true;
        });

        // tell server to play video
        this._publish(this.TOPICS.PLAY, {
            clientId: _this.clientId,
            resp_topic: video_topic
        });

        return false; // remove after single use.
    }
}
