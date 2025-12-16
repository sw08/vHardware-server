const dgram = require('dgram');
const EventEmitter = require('events');
const config = require('./config');


class XplaneUDPClient extends EventEmitter {
    constructor () {
        super();
        // console.log(config);
        this.host = config.XPLANE_UDP_HOST;

        this.sendPort = config.XPLANE_UDP_SEND_PORT;
        this.sendSocket = dgram.createSocket('udp4');
        this.sendSocket.connect(this.sendPort, this.host);
        this.connected = false;
        this.sendSocket.on('connect', () => {
            this.connected = true;
        });

        this.recvPort = config.XPLANE_UDP_RECV_PORT;
        this.recvSocket = dgram.createSocket('udp4');
        this.recvSocket.bind(this.recvPort, this.host);
        this.on = this.recvSocket.on;

        this.subscribed = [];
    }

    executeCommand(command) {
        let buf = Buffer.alloc(5 + command.length);
        buf.write('CMND\0');
        buf.write(command, 5);
        this.sendSocket.send(buf);
    }
    setDataref(dref, value) {
        let buf = Buffer.alloc(509);
        buf.write('DREF\0');
        buf.writeFloatLE(value, 5);
        buf.write(dref, 9);
        this.sendSocket.send(buf);
    }
    _RREF(dref, index, freq) {
        let buf = Buffer.alloc(400);
        buf.write('RREF\0');
        buf.writeInt32LE(freq, 5);
        buf.writeInt32LE(index, 9);
        buf.write(dref, 13);
        this.sendSocket.send(buf);
    }
    subscribe(dref, index, freq = 1) {
        this._RREF(dref, index, freq);
        this.subscribed.push({dref, index});
    }
    unsubscribe(dref, index) {
        this._RREF(dref, index, 0);
    }

    close (autoUnsub = false) {
        if (autoUnsub) {
            for (let sub of this.subscribed) {
                this.unsubscribe(sub.dref, sub.index);
            }
        }
        this.sendSocket.close();
        this.recvSocket.close();
    }
}
module.exports = XplaneUDPClient;