'use strict';

const DEBUGGING = false;
const DELIM = '~';
const FUDGED_LENGTH_RATIO = 0.05;
const SUFFIX_LENGTH = 2;
const FUDGED_PHONEME_LENGTH = 2;
const RATIO_OF_PHONEME_EXCLUSION = 0.25;

const suffixes = ['ing'];
const file = require('path').resolve(__dirname, './dictionary.txt')+[];
const hyphenopoly = require('hyphenopoly');
const hyphenator = hyphenopoly.config(
    {
        'require': ['de', 'en-us'],
        'hyphen': DELIM,
        'exceptions': {
            'en-us': 'en-han-us'
        }
    }
);
var FileReader = require('./FileReader');

async function hyphenate_en(text) {
    const hyphenateText = await hyphenator.get('en-us');
    return hyphenateText(text);
}
var log = function() {
    if (DEBUGGING) {
        console.log.apply(console, arguments);
    }
};
let fudge = async function(firstWord, callback) {
    firstWord = firstWord.toLowerCase();
    if (firstWord.length <= 2) {
        callback(new Array(firstWord));
        return;
    }
    var hyphenateText = await hyphenator.get('en-us');
    let lineNr = 0;
    let found_words = [];
    log(`firstWord: (${firstWord})`);
    findSuffix(firstWord, async function(word, suffix) {
       // match all lines from dictionary using t his regular expression:
       //  if matching to 'word', with fudged length of 4: /^word.{0,4}$/
       //  this is to allow for words with new characters at the end

        // however, we also want to match fudged phonemes.
        // to do this, we figure out the hyphenation of the word,
        // and replace the hyphens with regex sub-expression .{0,2}
        // for example, 'basketball' becomes 'bas-ket-ball' => 'bas.{0,2}ket.{0,2}ball'
        // this allows us to fudge or insert new letters and match fudged words.
        log(`word: (${word})`);
        let hyphened = await hyphenate_en(word);
        log(`hyphened: ${hyphened}`);
        randomMix(hyphened, async function(mix, rest) {
            log(`mix: ${mix}, rest: ${rest}`);
            mix += '.{0,2}';

            // leaving first char alone; try to replace consonants with a random consonant
            let replaced = replaceConsonants(mix);
            if (!replaced.endsWith('}')) {
                replaced += `{0,${FUDGED_PHONEME_LENGTH}}`;
            }

            let FUDGED_LENGTH = Math.floor(firstWord.length * FUDGED_LENGTH_RATIO);
            let expression = new RegExp(`^${replaced}.{0,${FUDGED_LENGTH}}$`);
            log(`searching:${expression}`);
            let reader = new FileReader(file, expression, firstWord);
            reader.read((data, done) => {
                found_words = found_words.concat(data);
                if (done) {
                    callback(found_words);
                } else {
                    reader.continue();
                }
            });
        });
    });
};
// input:
//      hyphened: a hyphenated word using DELIM as a delimiter between 'phonemes'
//      callback: function that takes params (mixedWord, rest)
//          where mixedWord is a word with randomly excluded phonemes,
//          andrest are the dropped phonemes left over [in sequence]
let randomMix = function(hyphened, callback) {
    let out = "";
    let phonemes = hyphened.split(DELIM);
    let rest = [];
    if (phonemes.length > 0) {
        out = phonemes[0];
        phonemes.shift();
    }
    while (phonemes.length > 0) {
        let seed = Math.random();
        let phoneme = phonemes[0];

        if (seed <= RATIO_OF_PHONEME_EXCLUSION) {
            out += phoneme.replace(/[^aeiouy]([^aeiouy])/g, '.');
            rest = [];
        } else {
            rest.push(phoneme);
        }
        phonemes.shift();
    }
    callback(out,rest);
};

let findSuffix = function(word, callback) {
    // ignore short words, because when ignoring the suffix, short
    // words change too much to be recognizable

    if (word.length <= 6) {
        callback(word,"");
        return;
    }
    let semaphore = false;
    let HAS_SUFFIX = new RegExp(suffixes.join('|'));
    let suffix = "";
    word = word.replace(HAS_SUFFIX, (match) => {
       for (let i = 1; i < arguments.length; i++) {
           let argument = arguments[i];
           suffix = argument;
       }
       return "";
    });
    if (suffix.length != 0) {
        callback(word,suffix);
        return;
    }
    // we don't need to find a suffix on a one letter word
    if (word.length <= 2) {
        callback(word,"");
        return;
    }
    // otherwise, we must find the actual word and its suffix
    let max = word.length - word.length / 2;
    if (max <= 0) max = 1;
    let clippedWord = word.substring(0,max);
    log(`clippedWord: ${clippedWord}`);
    // return first matched line from dictionary with this regular expression:
    //      if matching to 'word', with suffix length of 3: /^word.{0,3}$/
    // we want to be able to match words even if they are missing their suffix
    let expression = new RegExp(`^${clippedWord}.{0,${SUFFIX_LENGTH}}`);
    log(`suffix-expression: ${expression}`);
    let reader = new FileReader(file, expression, word, true);
    reader.read((data, done) => {
       if (!semaphore && done) {
           semaphore = true;
           if (data !== word && data.length > 0) {
               let difference = Math.abs(data.length - word.length);
               let length = word.length;
               suffix = word.substring(length,length + difference);
               callback(data + "", suffix);
           } else {
               callback(word, suffix);
           }
       }
    });
};

// replace all consonants with interchangeable regex match groups
let replaceConsonants = function(word) {
    let vowelIndex = word.match(/[aeiou]/);
    vowelIndex = vowelIndex && vowelIndex.index;
    let firstChars = word.substring(0,vowelIndex);
    let rest = word.substring(vowelIndex, word.length);
    let NOT_VOWELS = /[^aeiou]/;
    let ANY_CONSONANT = '[bcdfghjklmnpqrstvwxz]';
    return firstChars + rest.replace(NOT_VOWELS,ANY_CONSONANT);
};
let obfuscate = async function(res, text) {
    let out = "";
    let ANY_SPACES = /\s+/;
    let ANY_PUNCTUATION = /[^[a-zA-Z]]+/;
    let ANY_LETTERS = /[a-zA-Z]+/;
    let words = text.split(ANY_SPACES);
    let count = words.length;
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (word.match(ANY_LETTERS)) {
            fudge(word, (replacements) => {
               if (replacements.length > 0) {
                   let randIndex = Math.floor(Math.random() * replacements.length);
                   let word = replacements[randIndex];
                   words[i] = word;
               }
               count--;
               if (count <= 0) {
                   log(`sending. count: ${count}, text: ${text}`);
                   res.end(words.join(' '));
               }
            });
        } else {
            count--;
        }
    }
};
module.exports = obfuscate;