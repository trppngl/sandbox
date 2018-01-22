var column = document.getElementById('column');

var sentences = [];
sentences.push.apply(sentences, document.getElementsByClassName('sentence'));
var numSentences = sentences.length;

var firstSegs = Array(numSentences);
for (var i = 0; i < numSentences; i++) {
  firstSegs[i] = sentences[i].firstElementChild;
}

var indents = Array(numSentences);

//

function show(el) {
  if (el) el.classList.remove('hide');
}

function hide(el) {
  if (el) el.classList.add('hide');
}

function getColumnLeft() {
  return column.getBoundingClientRect().left;
}

//

function getIndents() {
  
  var columnLeft = getColumnLeft();
  
  for (var i = 0; i < numSentences; i++) {
    indents[i] = firstSegs[i].getClientRects()[0].left - columnLeft;
  }
}

var t0 = performance.now();
getIndents();
var t1 = performance.now();
console.log((t1 - t0).toFixed(3) + "ms");
