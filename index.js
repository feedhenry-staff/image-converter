'use strict';

var fs = require('fs')
  , path = require('path')
  , fhlog = require('fhlog')
  , async = require('async')
  , crypto = require('crypto')
  , imagemagick = require('node-imagemagick');

// Logger instance that a user can configure
var logger = exports.logger = fhlog.getLogger('Image Converter');
// Default level is error
logger.setLogLevel(fhlog.LEVELS.ERROR);

// Where to write temporary files
var FILE_DIR = '/tmp';


/**
 * Return the given data as a buffer of the specified type.
 * @param   {String|Buffer} data
 * @returns {Buffer}
 */
function getDataAsBuffer (data) {
  return (data instanceof Buffer) ? data : new Buffer(data);
}


/**
 * Get a unique ID for the given data.
 * @param   {String} data
 * @returns {String}
 */
function getName (data) {
  var hash = crypto.createHash('md5');

  // Should be pretty darn random (famous last words...)
  hash.update(data);
  hash.update(Date.now().toString());
  hash.update(Math.random().toString());

  return hash.digest('hex');
}


/**
 * Delete a file if it exists.
 * @param {String}    filePath
 * @param {Function}  callback
 */
function deleteFile (filePath, callback) {
  fs.exists(filePath, function (exists) {
    if (exists) {
      fs.unlink(filePath, callback);
    } else {
      callback(null);
    }
  });
}


/**
 * Set the temporary directory to which files should be written.
 * @param {String}
 */
exports.setFileDirectory = function (dir) {
  FILE_DIR = dir;
};


/**
 * Get file directory where temporary images are stored.
 * @returns {String}
 */
exports.getFileDirectory = function () {
  return FILE_DIR;
};


/**
 * Convert the given data to JPEG format.
 * @param {String|Buffer}
 * @param {String}
 * @param {String}
 * @param {Function}
 */
exports.convert = function (originalBytes, fromType, toType, callback) {
  if (typeof fromType !== 'string' || typeof toType !== 'string') {
    return callback(new Error('from and to params should be strings'), null);
  }

  // Ensure data is a buffer
  originalBytes = getDataAsBuffer(originalBytes);

  logger.debug('Got bytes as a Buffer object for %s => %s', fromType, toType);

  var name = getName(originalBytes.toString('base64')),
    toPath = path.join(FILE_DIR, name.concat('.').concat(toType)),
    fromPath = path.join(FILE_DIR, name.concat('.').concat(fromType));

  logger.info('Start convert %s => %s', fromPath, toPath);

  async.series({
    writeFile: function writeFile (cb) {
      logger.debug('Writing %s (original) to disk', fromPath);
      fs.writeFile(fromPath, originalBytes, cb);
    },
    convertFile: function convertFile (cb) {
      logger.debug('Converting %s to %s', fromPath, toPath);
      imagemagick.convert([fromPath, toPath], cb);
    },
    readBytes: function readBytes (cb) {
      logger.debug('Reading %s (converted) bytes from disk', toPath);
      fs.readFile(toPath, cb);
    }
  }, function (err, res) {
    if (!err) {
      logger.info('Conveted %s to %s successfully', fromPath, toPath);
    } else {
      logger.error('Error converting %s to %s: \n%j', fromPath, toPath, err);
    }

    // Delete the temp files we created if they exist
    if (res.readBytes) {
      async.each([fromPath, toPath], deleteFile, function (e) {
        if (e) {
          logger.error('Error deleting temp file %s or %s due to error %j',
            fromPath, toPath, e);
        } else {
          logger.debug('Removed temporary files: %s, and %s', fromPath, toPath);
        }
      });
    }

    callback(err || null, res.readBytes);
  });
};
