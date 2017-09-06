#!/usr/bin/env node
const Crypto = require('iota.crypto.js');
const Encryption = require('../lib/encryption');
const IOTA = require('iota.lib.js');
const MAM = require('../lib/mam');
const MerkleTree = require('../lib/merkle');
const program = require('commander');

program
  .arguments('<seed> <message>')
  .option('--channel-key-index <channelKeyIndex>')
  .option('--start <start>')
  .option('--count <count>')
  .option('--security-level <securityLevel>')
  .action(function(seed, message) {
    const channelKeyIndex = program.channelKeyIndex || 0;
    const securityLevel = program.securityLevel || 2;
    const start = program.start || 0;
    const count = program.count || 1;

    const channelKey = Crypto.converter.trytes(MAM.channelKey(Encryption.hash(Encryption.increment(Crypto.converter.trits(seed.slice()))), channelKeyIndex));

    const tree0 = new MerkleTree(seed, start, count, securityLevel);
    const tree1 = new MerkleTree(seed, start + count, count, securityLevel);
    let index = 0;

    const iota = new IOTA();

    // Get the trytes of the MAM transactions
    const trytes = new MAM.create({
        message: iota.utils.toTrytes(message),
        merkleTree: tree0,
        index: index,
        nextRoot: tree1.root.hash.toString(),
        channelKey: channelKey,
    });

    console.log(JSON.stringify(trytes));
  })
  .parse(process.argv);
