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

//Recursive Eulers algorithm to find the word
function EulersRecursive(lowerbound, upperbound, word) {

  var middlebound = Math.floor((upper_bound + lower_bound) / 2); //find the average and floor it for middle
  if (middlebound == lowerbound) return false; //becaue floor, this means word will never be found

  if (!lookup(middlebound) || lookup(middlebound).toLowerCase() > word)
    return EulersRecursive(lowerbound, middlebound, word) //if middle word is an overshoot;

  else if (lookup(middlebound).toLowerCase() < word)
    return EulersRecursive(middlebound, upperbound, word);

  else
    return middlebound;
}

//To find the upperbound of the dictionary
function lookupWordEulersGallop(word) {
  
  if (!lookup(0)) return false; //if no words exist, ours doesn't either

  word = word.toLowerCase(); //for string compare to work

  //instead of a step size of a 1000, use gallop search for O(logn) instead of O(n/1000)
  var upper_bound = 1;
  
  var upper_bound_found = false;
  while (lookup(upper_bound) && !upper_bound_found) { //if the dictionary is over, that's our upper bound
    if (lookup(upper_bound).toLowerCase() == word) //since our recursive depends on bounds being checked
      return upper_bound; 
    else if (lookup(upper_bound).toLowerCase() > word) //this is our upper bound, kill the loop
      upper_bound_found = true; 
    else upper_bound *= 2; //try again with twice the test bound
  }

  var lower_bound = Math.floor(upper_bound/2); //set the lower bound based on gallop search
  if (lookup(lower_bound).toLowerCase()) == word) return lower_bound; //since our recursive depends on bounds being checked

  //both lower and upper bound have been checked before sending it in
  return EulersRecursive(lower_bound, upper_bound, word);
}