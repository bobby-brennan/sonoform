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

Sonoform.prototype.addText = function(text) {
  var self = this;
  self.o.inputs.forEach(function(i) {
    var match = i.match(text);
    if (match) self.o.onMatch(i.o.name, match);
  })
}

Sonoform.Input = function(opts) {
  this.o = opts = opts || {};
  opts.patterns = opts.patterns || [];
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

