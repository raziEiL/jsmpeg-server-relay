const PackType = {
    Event: 0,
    Mpegts: 1
};

const EventType = {
    Close: 0
};
/**
 * Create Buffer 'package' with size 4 bytes + buffer bytes. 
 * 0 index = PackType byte, 
 * 1 index = options.type byte, 
 * 2 index = options.data byte, 
 * 3 index = options.team byte, 
 * 4 index = nickname byte len
 * 5 index = nickname start byte
 * other remaining bytes options.concatBuffer bytes
 */
function packBuffer(options) {
    const buff = Buffer.alloc(5);
    buff.writeInt8(options.packType);
    buff.writeInt8(options.data, 2);

    switch (options.packType) {
        case PackType.Event: {
            if (options.type)
                buff.writeInt8(options.type, 1);
            if (options.concatBuffer)
                return Buffer.concat([buff, options.concatBuffer]);
            break;
        }
        case PackType.Mpegts: {
            if (options.team)
                buff.writeInt8(options.team, 3);
            if (options.nickname) {
                const nick8array = new TextEncoder().encode(unescape(options.nickname));
                buff.writeInt8(nick8array.length, 4);
                return Buffer.concat([buff, nick8array]);
            }
            break;
        }
    }

    return buff;
}

function packConcat(packBf, buffer) {
    return Buffer.concat([packBf, buffer]);
}

/**
 * Unpack buffer to Options Object. {packType: number, type: number, data: number, concatBuffer: Buffer}
 */
function unpackBuffer(buffer) {
    const unit8 = new Uint8Array(buffer);
    const nickLength = Buffer.from(unit8).readInt8(4);
    return {
        packType: Buffer.from(unit8).readInt8(),
        type: Buffer.from(unit8).readInt8(1),
        data: Buffer.from(unit8).readInt8(2),
        team: Buffer.from(unit8).readInt8(3),
        nickname: nickLength ? new TextDecoder().decode(unit8.slice(5, 5 + nickLength)) : undefined,
        concatBuffer: unit8.slice(5 + nickLength),
    };
}

module.exports = { unpackBuffer, packBuffer, packConcat, PackType, EventType };