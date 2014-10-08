'use strict';

var converter = require('../index.js')
  , imagetype = require('image-type')
  , expect = require('chai').expect
  , async = require('async')
  , path = require('path')
  , fs = require('fs');

var TEST_IMG_DIR = path.join(__dirname, './img');
var JPEG_BYTES = fs.readFileSync(path.join(__dirname, './test.jpg'));

after(function (done) {
  fs.readdir(TEST_IMG_DIR, function (err, list) {
    async.each(list, function (file, cb) {
      // Only delete files
      if (path.extname(file) !== '') {
        fs.unlink(path.join(TEST_IMG_DIR, file), cb);
      } else {
        cb();
      }
    }, done);
  });
});

describe('Image Converter Module', function () {

  describe('logger property', function () {
    it ('Should return a logger', function () {
      var logger = converter.logger;
      expect(logger).to.be.an('object');
    });
  })

  describe('#getFileDirectory', function () {
    it ('Should return the default temp directory', function () {
      var dir = converter.getFileDirectory();

      expect(dir).to.be.a('string');
      expect(dir).to.equal('/tmp');
    });
  });

  describe('#setFileDirectory', function () {
    it ('Should return the default temp directory', function () {
      var dir = converter.getFileDirectory();

      expect(dir).to.be.a('string');
      expect(dir).to.equal('/tmp');
    });

    it ('Should return a newly set temp directory', function () {
      converter.setFileDirectory(TEST_IMG_DIR);

      var dir = converter.getFileDirectory();

      expect(dir).to.be.a('string');
      expect(dir).to.equal(TEST_IMG_DIR);
    });
  });

  describe('#convert', function () {
    beforeEach(function () {
      converter.setFileDirectory(TEST_IMG_DIR);
    });

    it ('Should return an error due to invalid "from" arg', function (done) {
      converter.convert(null, null, 'jpg', function (err, bytes) {
        expect(err).to.be.defined;
        expect(bytes).to.be.null;
        done();
      });
    });

    it ('Should return an error due to invalid "to" arg', function (done) {
      converter.convert(null, 'jpg', null, function (err, bytes) {
        expect(err).to.be.defined;
        expect(bytes).to.be.null;
        done();
      });
    });

    it ('Should convert the given JPG to a PNG', function (done) {
      converter.convert(JPEG_BYTES, 'jpg', 'png', function (err, pngBytes) {
        expect(err).to.be.null;
        expect(pngBytes).to.be.defined;
        expect(imagetype(pngBytes)).to.equal('png');
        done();
      });
    });
  })
});
