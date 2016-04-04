var Sonoform = function(opts) {
  this.o = opts = opts || {};
  opts.inputs = opts.inputs || [];
  opts.inputs = opts.inputs.map(function(i) {
    return new Sonoform.Input(i);
  });
  opts.onMatch = opts.onMatch || function() {};
}

if (typeof window === 'undefined') {
  module.exports = Sonoform;
} else {
  window.Sonoform = Sonoform;
}

var NUMBERS = {
  'one'  : 1,
  'two'  : 2,
  'three': 3,
  'four' : 4,
  'five' : 5,
  'six'  : 6,
  'seven': 7,
  'eight': 8,
  'nine' : 9,
  'zero' : 0,
}
var REPLACEMENTS = [];
for (var n in NUMBERS) {
  REPLACEMENTS.push({
    regex: new RegExp('(\\W?)' + n + '(\\W?)', 'gi'),
    with: '$1' + NUMBERS[n].toString() + '$2',
  })
}

function normalize(text) {
  REPLACEMENTS.forEach(function(r) {
    text = text.replace(r.regex, r.with);
  });
  return text;
}

Sonoform.prototype.addText = function(text) {
  var self = this;
  text = normalize(text);
  self.o.inputs.forEach(function(i) {
    var match = i.match(text);
    if (match) self.o.onMatch(i.o.name, match);
  })
}

Sonoform.Input = function(opts) {
  this.o = opts = opts || {};
  opts.patterns = opts.patterns || [];
  opts.patterns = opts.patterns.map(function(p) {
    if (typeof p === 'string') {
      p = new RegExp(p, 'i');
    }
    return p;
  })
  opts.canonicalize = opts.canonicalize || function(v) {return v};
  if (this.o.choices) this.o.choices = this.o.choices.map(function(c) {
    return c.toString().toLowerCase();
  })
}

Sonoform.Input.prototype.matchList = function(text) {
  if (!this.o.choices) return [];
  text = text.toLowerCase();
  return this.o.choices.filter(function(c) {
    return text.indexOf(c) !== -1;
  })
}

Sonoform.Input.prototype.match = function(text) {
  var self = this;
  if (self.o.type === 'list') return self.matchList(text);
  var matches = self.o.patterns.map(function(p) {
    var match = text.match(p);
    if (!match) return;
    return match[match.length - 1];
  }).map(function(m) {
    if (self.o.type === 'number') {
      try {
        return parseFloat(m);
      } catch (e) {
        return;
      }
    }
    return m;
  })
  .filter(function(m) {return m})
  .map(self.o.canonicalize);
  if (self.o.choices) {
    matches = matches.filter(function(m) {
      return self.o.choices.indexOf(m) !== -1;
    })
  }
  return matches[0];
}

