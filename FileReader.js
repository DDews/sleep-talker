'use strict'

const fs = require('fs'),
    util = require('util'),
    stream = require('stream'),
    es = require('event-stream'),
    parse = require("csv-parse"),
    iconv = require('iconv-lite');

class FileReader {
    constructor(filename, regex =/.*/, original, haltOnFind = false, batchSize, columns) {
        this.original = original;
        this.found = false;
        this.finished = false;
        this.haltOnFind = haltOnFind;
        this.reader = fs.createReadStream(filename).pipe(iconv.decodeStream('utf8'))
        this.batchSize = batchSize || 1000
        this.lineNumber = 0
        this.data = []
        this.parseOptions = {delimiter: '\t', columns: true, escape: '/', relax: true}
        this.regex = regex;
    }

    read(callback) {
        let HAS_VOWEL = /^[^aeiou]+$/;
        let IS_SHORT = /^[.|aeiou]{0,3}$/;
        let me = this;
        this.reader
            .pipe(es.split())
            .pipe(es.mapSync(line => {
                ++this.lineNumber;

                // parse as regex
                if (line.match(me.regex)
                    && !line.match(HAS_VOWEL)
                    && !line.match(IS_SHORT)) {
                    if (line !== me.original) me.data.push(line);
                    if (!me.finished && me.haltOnFind) {
                        me.finished = true;
                        callback(me.data, true);
                        me.stop();
                        return;
                    }
                }
                if (me.lineNumber % me.batchSize === 0) {
                    callback(me.data, false);
                }
            })
            .on('error', function(err){
                console.log('Error while reading file:', err)
            })
            .on('end', function(){
                if (!me.finished) {
                    me.finished = true;
                    callback(me.data,true);
                }
                console.log('Read entire file.');
            }))
    }
    stop() {
        this.reader.end();
    }

    continue () {
        this.data = []
        this.reader.resume()
    }
}

module.exports = FileReader;