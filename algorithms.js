/*
Hello there Polychat Recruiter (or curious people browsing my code)!
First off, I would like to note I've never actually used Node.Js before, so
please pardon my ignorance of any subtle nuances of the framework I may have missed.

Problem Statement:
"The goal of this challenge is to find the index of a given word in a dictionary.
The only way to interface with the dictionary is through a function `lookup(index)`,
which either returns the word at that index, or `false` if the index is out of
bounds. Words are represented as strings. The indices of the dictionary are a
contiguous set of non-negative integers starting with 0."

Testing Procedure:
I verified this code is correct by manually testing cases. Not the best way,
I could have written some test cases, but that seemed a little bit of overkill

Time spent: ~1h
*/

const DICTIONARY_FILE = '/usr/share/dict/words';

var dictionary = [];

// Note: this assumes the file is not blank, and every line actually contains a word
// I also got this line from somewhere on stackoverflow, as I wasn't familiar
// with nodeJs libraries and such.

var fs = require('fs')
  , dictionary = fs.readFileSync(DICTIONARY_FILE).toString().split("\n");

// Replicating that `lookup(index)` function described.
// I've assumed this function is zero indexed.
function lookup(index) {
  return (index >= 0 && index <= dictionary.length - 1) ? dictionary[index] : false;
}


/*
This isn't the most efficient algorithim, just a brute force one, guaranteed results
as long as n does not exceed the size of JavaScript integers, or your patience. 
Run times: O(n), o(c)
*/

function lookupWordBruteForce(word) {
  var i = 0
    , result;

  while(result = lookup(i)) {
    if(result == word)
      return i;

    ++i;
  }

  // Word not found
  return false;
}

/*
First we build a hash, which will have a runtime the same as the bruteforce method.
However, once the hash is stored in memory, it will be a constant lookup time.
This can be good if the dictionary can fit in the memory constraints of the application.
However, if the length of the dictionary is rather large, building up the hash might take
some time, and might not even fit in memory.
Runtime: O(n), o(n)
*/

function buildWordHash() {
  var dictionary_hash = {}
    , i = 0
    , word = null;

  while(word = lookup(i)) {
    dictionary_hash[word] = i;
    ++i;
  }

  return dictionary_hash;
}
var dictionary_hash = buildWordHash();

/*
Assuming we've built the dictionary hash, we can look it up with constant time
Runtime: O(c), o(c)
*/

function lookupWordHash(word) {
  var index = dictionary_hash[word];

  // Note: the result might be undefined if the word doesn't exist
  return word === 'undefined' ? false : index;
}

/*
This method will use Euler's Method to find a suitable index

One problem found is that my dictionary file has a blank line at the end, so this
algorithim fails with words towards the end. Removing the line fixed it, however,
the algorithim could be adjusted to handle this. Another note, this really only works
for strings that can be compared with '<' and '>' to determine their aphebetical order,
I'm not really sure how this would for languages with other character sets.

We also convert all words we are working with to lowercase.
This is due to string comparison operators not working as expected with uppercase words.
This can might return the wrong index due to words such as "Cat" and "cat" being beside
each other.

Runtime: Not really sure how to calculate this but from manual testing of random
samples of words, it's the fastest of all three. The highest runtime I got was
245 times for elements towards the end of the dictionary, nice! 
*/

function lookupWordEulers(word) {
  word = word.toLowerCase();
  const STEP_SIZE = 1000;

  var lower_bound = 0;
  var upper_bound = STEP_SIZE;
  var middle_bound = Math.floor((upper_bound - lower_bound) / 2);

  var lower_word = null;
  var upper_word = null;
  var middle_word = null;

  // Infinite loops are bad :p
  while(true) {
    lower_word = lookup(lower_bound);
    upper_word = lookup(upper_bound);

    // If the value if out of range, .toLowerCase() will fail
    if(upper_word)
      upper_word = upper_word.toLowerCase();
    if(lower_word)
      lower_word = lower_word.toLowerCase();

    if(lower_word == word)
      return lower_bound;
    if(upper_word == word)
      return upper_bound;

    if(upper_bound - lower_bound == 1) { // Word not found
      return false;
    }

    if(lower_word < word && (word < upper_word || !upper_word) ) {
      middle_bound = Math.floor((lower_bound + upper_bound) / 2);
      middle_word = lookup(middle_bound);

      if(middle_word)
        middle_word = middle_word.toLowerCase();
      else { // the lookup was out of range
        upper_bound = middle_bound;
        continue;
      }

      if(middle_word == word)
        return middle_bound;
      else if(middle_word > word)
        upper_bound = middle_bound;
      else // assuming middle_word < word
        lower_bound = middle_bound;

    } else { // word > upper_word
      /* Here we are trying a new range that is arbitrarily increased by STEP_SIZE.
      I did some research after the fact by consulting my pears and Gallop search
      can be used for increasing the bounds. */
      lower_bound = upper_bound;
      upper_bound = lower_bound + STEP_SIZE;
    }
  }
}