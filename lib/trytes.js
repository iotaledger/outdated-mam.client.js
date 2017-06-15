var crypto = require('crypto.iota.js');
var converter = crypto.converter;

// TODO: Remove this.  Hopefully this will not be necessary for long.
// The converter.trytes function doesn't work correctly with array
// lengths not divisible by three.
function temporaryPadding(trits) {
    while (trits.length === 0 || trits.length % 3 !== 0) {
        trits.push(0);
    }
    return trits;
}

function encodeNumberToTrytes(number) {
    var trits = converter.fromValue(number); // returns an array of trits
    var paddedTrits = temporaryPadding(trits);
    return converter.trytes(paddedTrits);
}

/* Take a tryte encoded string, and make a pascal ended version */
function encodePascalsTrytes(trytes) {
    // Get the length of the tryte string and encode that in trytes.
    var totalLength = encodeNumberToTrytes(trytes.length);

    // The first tryte will tell how many trytes are needed to encode
    // the length we found above.
    var lengthTrytes =
        encodeNumberToTrytes(totalLength.length);

    // return the final pascal version of the trytes
    return lengthTrytes + totalLength + trytes;
}

module.exports = {
    encodePascalsTrytes
};
