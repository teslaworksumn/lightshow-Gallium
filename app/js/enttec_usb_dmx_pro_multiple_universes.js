"use strict"

var SerialPort = require("serialport")

var   ENTTEC_PRO_DMX_STARTCODE = 0x00
    , ENTTEC_PRO_START_OF_MSG  = 0x7e
    , ENTTEC_PRO_END_OF_MSG    = 0xe7
    , ENTTEC_PRO_SEND_DMX_RQ   = 0x06
    , ENTTEC_PRO_RECV_DMX_PKT  = 0x05
    ;

// send to universe #2
var DMX_PRO_SEND_PACKET2 = 0xA9;
var ENTTEC_PRO_ENABLE_API2 = 0x0D;
var ENTTEC_PRO_PORT_ASS_REQ = 0xCB;

// API key bytes
var key0 = 0xC8;
var key1 = 0xD0;
var key2 = 0x88;
var key3 = 0xAD;

function EnttecUSBDMXPROMultipleUniverses(device_id, options) {
    var self = this
    options = options || {}
    this.universe = new Buffer(513)
    this.universe.fill(0)

    this.dev = new SerialPort(device_id, {
        'baudRate': 250000,
        'dataBits': 8,
        'stopBits': 2,
        'parity': 'none'
    }, function(err) {
        if(!err) {
            self.send_universe()
        }
    })

    this.activate_second_universe();
}

EnttecUSBDMXPROMultipleUniverses.prototype.activate_second_universe = function() {
    if(!this.dev.writable) {
        return
    }

    let datasize = 4;

    var msg = Buffer([
        ENTTEC_PRO_START_OF_MSG,
        ENTTEC_PRO_ENABLE_API2,
        (datasize)       & 0xff,
        (datasize >> 8)  & 0xff,
        key3,
        key2,
        key1,
        key0,
        ENTTEC_PRO_END_OF_MSG
    ]);

    this.dev.write(msg)

    datasize = 2;

    msg = Buffer([
        ENTTEC_PRO_START_OF_MSG,
        ENTTEC_PRO_PORT_ASS_REQ,
        datasize & 0xff,
        (datasize >> 8) & 0xff,
        1,
        1,
        ENTTEC_PRO_END_OF_MSG
    ]);

    this.dev.write(msg)
}

EnttecUSBDMXPROMultipleUniverses.prototype.send_universe = function() {
    if(!this.dev.writable) {
        return
    }

    var hdr1 = Buffer([
        ENTTEC_PRO_START_OF_MSG,
        ENTTEC_PRO_SEND_DMX_RQ,
         (this.universe.length)       & 0xff,
        ((this.universe.length) >> 8) & 0xff,
        ENTTEC_PRO_DMX_STARTCODE
    ]);

    var msg1 = Buffer.concat([
        hdr1,
        this.universe.slice(1),
        Buffer([ENTTEC_PRO_END_OF_MSG])
    ]);

    var hdr2 = Buffer([
        ENTTEC_PRO_START_OF_MSG,
        DMX_PRO_SEND_PACKET2,
         (this.universe.length)       & 0xff,
        ((this.universe.length) >> 8) & 0xff,
        ENTTEC_PRO_DMX_STARTCODE
    ]);
    var msg2 = Buffer.concat([
        hdr2,
        this.universe.slice(1),
        Buffer([ENTTEC_PRO_END_OF_MSG])
    ]);

    this.dev.write(msg1)
    this.dev.write(msg2)
}

EnttecUSBDMXPROMultipleUniverses.prototype.start = function() {}
EnttecUSBDMXPROMultipleUniverses.prototype.stop = function() {}

EnttecUSBDMXPROMultipleUniverses.prototype.close = function(cb) {
    this.dev.close(cb)
}

EnttecUSBDMXPROMultipleUniverses.prototype.update = function(u) {
    for(var c in u) {
        this.universe[c] = u[c]
    }
    this.send_universe()
}

EnttecUSBDMXPROMultipleUniverses.prototype.updateAll = function(v){
    for(var i = 1; i <= 512; i++) {
        this.universe[i] = v
    }
    this.send_universe()
}

EnttecUSBDMXPROMultipleUniverses.prototype.get = function(c) {
    return this.universe[c]
}

module.exports = EnttecUSBDMXPROMultipleUniverses
