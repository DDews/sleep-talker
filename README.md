# Sleep-Talker - Text-speech obfuscator

This hosts a web-api and webapp with user interface.

It allows a user to convert any english text into "sleep talked" text, by obfuscating english words to other english words with similar phonemes.

This text obfuscation is non-deterministic, one-way word obfuscation.

Therefore it does not always produce the same text from the same input, and it cannot produce the original words from obfuscated text.

The obfuscation algorithm randomly chooses how flexible its selection will be when determining replacements.

This is to produce a more unpredictable, and 'enjoyable' replacement.

# Why use this?
Novelty. Other than that, you could use it to play a silly game to pass time on a road trip:

One use-case is to pick well-known quotes, obfuscate them to sleep-talk gibberish, and only provide friends with the obfuscation, asking them what they think the quote is.

After explaining to them that it replaces word for word, and chooses words with similar phonemes, it should be possible, with few hints, to guess the original phrase.



# Example

`Bears. Beets. Battlestar galactica.` -> `Bears. Beets. bacon galaxy.`

`The quick fox jumps over the lazy dog` -> `ther quickly forms jumps oder them lawyer donor`

`This is such a dumb application` -> `thigh is sushi a durban agri`

# Setup and Install

This project uses NodeJS v10.
If it is not already installed, I suggest using NVM to install and have it use NodeJS v10

Next, run the following commands:
`npm install`
if any auditing exceptions occur, follow the suggestions to fix any upgraded node modules.

next, run the application:
`npm start`

It should start hosting the webapp on port 3000.
Navigate in your browser of choice to: http://localhost:3000/



