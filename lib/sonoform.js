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
}

Sonoform.Input.prototype.match = function(text) {
  var self = this;
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
  }).filter(function(m) {return m});
  return matches[0];
}

