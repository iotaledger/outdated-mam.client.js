var tryteValues = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function numberToTryte(number) {
    if (number < 0) {
        return null;
    }

    var tryteEncodedNumber = '';
    do {
        var index = number % 27;
        tryteEncodedNumber = tryteValues[index] + tryteEncodedNumber;
        number = (number - index) / 27;
    } while (number > 0);

    return tryteEncodedNumber;
}

/* Take a tryte encoded string, and make a pascal ended version */
function pascalsTrytes(trytes) {
    // Get the length of the tryte string and encode that in trytes.
    var tryteEncodedTotalLength = numberToTryte(trytes.length);

    // The first tryte will tell how many trytes are needed to encode
    // the length we found above.
    var tryteEncodedSizeToStoreTryteEncodedTotalLength = numberToTryte(tryteEncodedTotalLength.length);

    // return the final pascal version of the trytes
    return tryteEncodedSizeToStoreTryteEncodedTotalLength + tryteEncodedTotalLength + trytes;
}

module.exports = {
    numberToTryte,
    pascalsTrytes
};
