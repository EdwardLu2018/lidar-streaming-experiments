import * as Paho from 'paho-mqtt';

export class MQTTStreamedVideoSource {
    constructor(host, port, handler) {
        // error numbers
        this.NOERROR = 0;
        this.WEBSOCKET_FAILURE = -1;
        this.CODEC_NOT_SUPPORTED = -2;

        this.TOPICS = {
            UNREGISTER: "client/unregister",
            REGISTER: "client/register",
            DESCRIBE: "client/describe",
            PLAY: "client/play",
            STOP: "client/stop"
        };

        this.mqtt_handlers = {};
        this.data_handler = null;

        this.clientId = "id_" + parseInt(Math.random());
        this.client = new Paho.Client(host, port, this.clientId);

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

        var options = {
            timeout: 3,
            onSuccess: function () {
                _this._onMqttConnected();
            },
            onFailure: function (message) {
                _this.handler({
                    error: "web socket failure",
                    errnum: _this.WEBSOCKET_FAILURE
                });
            }
        };
        // last will message sent on disconnect
        var willmsg = new Paho.Message(JSON.stringify({
            clientId: _this.clientId
        }));
        willmsg.qos = 2;
        willmsg.destinationName = this.TOPICS.UNREGISTER;
        willmsg.retained = true;
        options.willMessage = willmsg;
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
        var resp_topic = "client/describe/response_" + parseInt(Math.random() * 1000000000);

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
