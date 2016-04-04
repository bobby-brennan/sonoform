var expect = require('chai').expect;
var Sonoform = require('../lib/sonoform.js');

describe('Sonoform', function() {
  it('should work', function(done) {
    var form = new Sonoform({
      inputs: [{
        name: 'age',
        type: 'number',
        patterns: [/(\d+) years? old/, /age (\d+)/],
      }],
      onMatch: function(name, value) {
        expect(name).to.equal('age');
        expect(value).to.equal(23);
        done();
      }
    });
    form.addText("He is a 23 year old male");
  });

  it('should do complex filling', function(done) {
    var numMatches = 0;
    var form = new Sonoform({
      inputs: [{
        name: 'name',
        type: 'text',
        patterns: [/name is (\w+)/, /named? (\w+)/],
      }, {
        name: 'age',
        type: 'number',
        patterns: [/(\d+) years? old/, /aged? (\d+)/],
      }, {
        name: 'vaccinations',
        type: 'list',
        patterns: [
          /vaccinat(:?ion|ions|ed)(:? (:?with|of)? (.*))/,
          /(.*) vaccines?/
        ],
        choices: ['rabies', 'measles', 'bordetella', 'worms'],
      }, {
        name: 'blood_pressure',
        type: 'text',
        patterns: [/\d+ over \d+/, /\d+\s*\/\s*\d+/],
        canonicalize: function(val) {
          return val.replace(/\s*(over|\/)\s*/, '/');
        }
      }],

      onMatch: function(name, val) {
        if (name === 'name') expect(val).to.equal('Lucy');
        if (name === 'age') expect(val).to.equal(2);
        if (name === 'vaccinations') expect(val).to.deep.equal(['Bordetella', 'rabies']);
        if (name === 'blood_pressure') expect(val).to.equal('120/80');
        if (++numMatches === 4) return done();
      }
    });
    form.addText("This dog, named Lucy, is age 2. She has her Bordetella and rabies vaccines and has a blood pressure of 120 over 80");
  });

  it('should parse numbers', function(done) {
    var form = new Sonoform({
      inputs: [{name: 'age', type: 'number', patterns: [/(\d+) years old/]}],
      onMatch: function(name, val) {
        expect(name).to.equal('age');
        expect(val).to.equal(2);
        done();
      }
    });
    form.addText("Two years old");
  });

  it('should parse dates', function(done) {
    var numMatched = 0;
    var bday = new Date('09-23-1987');
    var form = new Sonoform({
      inputs: [{name: 'birthday', type: 'date', patterns: ['My birthday is (.*)']}],
      onMatch: function(name, val) {
        expect(name).to.equal('birthday');
        expect(val.getTime()).to.equal(bday.getTime());
        if (++numMatched === 4) done();
      }
    });
    form.addText('My birthday is September 23, 1987 every day of the year');
    form.addText('My birthday is 9/23/1987. OK?');
    form.addText('My birthday is 9-23-1987');
    form.addText('My birthday is Sept. 23rd, 1987');
  });

  it('should allow lists', function(done) {
    var numMatched = 0;
    var form = new Sonoform({
      inputs: [{
        name: 'pets',
        type: 'list',
        patterns: ['.*'],
      }],
      onMatch: function(name, val) {
        expect(val).to.deep.equal(outputs[numMatched++]);
        if (numMatched === outputs.length) done();
      }
    });
    var outputs = [
      ['a', 'b', 'c'],
      ['foo', 'bar'],
    ];
    form.addText('a, b, and c');
    form.addText('foo bar');
  })
})
