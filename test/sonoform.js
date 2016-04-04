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
  })
})
