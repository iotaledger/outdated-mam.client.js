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
    var trits = converter.fromValue(number);
    var paddedTrits = temporaryPadding(trits);
    return converter.trytes(paddedTrits);
}

function decodeTrytesToNumber(trytes) {
    var trits = converter.trits(trytes);
    return converter.value(trits);
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

/**
 * Take a pascal encoded tryte string and convert it back to the original
 * [AFABCDEF]
 *  ^--- First tryte is # of trytes to follow that indicate length.  A = 1
 *   ^-- Since A = 1 we take the next 1 tryte to get the total string length.  F = 6
 *    ^- The next 6 trytes are the original string.
*/
function decodePascalsTrytes(pascalTrytes) {
    var totalLengthNumberOfTrytes = decodeTrytesToNumber(pascalTrytes.slice(0, 1));

    var totalLength = decodeTrytesToNumber(pascalTrytes.slice(1, 1 + totalLengthNumberOfTrytes));

    return pascalTrytes.slice(1 + totalLengthNumberOfTrytes, 1 + totalLengthNumberOfTrytes + totalLength);
}

module.exports = {
    decodePascalsTrytes,
    encodePascalsTrytes
};
