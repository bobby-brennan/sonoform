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
    regex: new RegExp('(\\W|^)' + n + '(\\W|$)', 'gi'),
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
  this.o.type = this.o.type || 'text';
  opts.patterns = opts.patterns || ['(.*)'];
  opts.patterns = opts.patterns.map(function(p) {
    if (typeof p === 'string') {
      p = new RegExp(p, 'i');
    }
    return p;
  })
  opts.canonicalize = opts.canonicalize || function(v) {return v};
  if (this.o.choices) this.o.choices = this.o.choices.map(function(c) {
    return c.toString().toLowerCase();
  });
}

Sonoform.Input.prototype.parse = function(text) {
  var self = this;
  if (self.o.type === 'text') {
    return text;
  } else if (self.o.type === 'number') {
    try {
      return parseFloat(text);
    } catch (e) {
      return;
    }
  } else if (self.o.type === 'list') {
    var things = text.split(/,? /).map(function(s) {return s.trim()}).filter(function(s) {return s && s !== 'and'});
    if (self.o.choices) things = things.filter(function(t) {
      return self.o.choices.indexOf(t.toLowerCase()) !== -1;
    });
    things = things.filter(function(t) {return t});
    return things.length ? things : undefined;
  } else if (self.o.type === 'date') {
    text = text.replace(/(\d)(st|nd|rd|th)(\W)/, '$1$3');
    var words = text.split(' ');
    var date = NaN;
    while (words.length && isNaN(date)) {
      date = new Date(words.join(' '));
      words.pop();
    }
    return isNaN(date) ? undefined : date;
  } else {
    throw new Error("Unknown input type " + self.o.type);
  }
}
Sonoform.Input.prototype.match = function(text) {
  var self = this;
  var matches = self.o.patterns.map(function(p) {
    var match = text.match(p);
    if (!match) return;
    return match[match.length - 1];
  })
    .filter(function(m) {return m})
    .map(function(m) {return self.parse(m)})
    .filter(function(m) {return m !== undefined})
    .map(self.o.canonicalize);
  return matches[0];
}

