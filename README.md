image-converter
======

Module for converting images from one format to another using ImageMagick. 
Naturally, ImageMagick must be installed. This has only been tested on 
Mac OS X, but should work fine on Linux variants too.

## Easy Peasy to Use
Bytes in Bytes out (BIBO?) is how this module operates. Send in a Buffer or 
String of bytes for the conversion and get some new ones in return. 

```javascript

var convert = require('image-converter'),
	fs = require('fs');

var imageData = fs.readFileSync('./image.jpg');

converter.convert(imageData, 'jpg', 'png', function (err, pngBytes) {
	// Proceed to do amazing things!
});

```

## ProTips

### Image Types
In the event you don't know the format of the image you're converting you could 
use the [image-type module](https://www.npmjs.org/package/image-type) which 
detects popular image types.

```javascript

var converter = require('image-converter'),
	imageType = require('image-type'), 
	fs = require('fs');

var imageData = fs.readFileSync('./image.jpg');
var originalFormat = imageType(imageData);

converter.convert(imageData, originalFormat, 'bmp', function (err, bmpBytes) {
	// Do more amazing stuff!
});

```

### CPU Usage
Converting images is CPU intensive, so be careful! You should probably use a 
queue such as [async.queue](https://github.com/caolan/async#queue) to prevent 
too many concurrent conversions.

## API

### convert(bytes, fromFormat, toFormat, callback)
Convert an image (_bytes_) from one the current format (_fromFormat_) to 
another format (_toFormat_). The callback receives a Buffer containing the new 
converted bytes.

### setFileDirectory(directory)
Change the directory that is used to store the temporary files used for 
conversion. This defaults to */tmp*. These files are always deleted immediately 
after the conversion.

### getFileDirectory()
Get the name of the directory where temporary files are stored.

### getLogger()
Returns a reference to the logger used internally by this module. This is an 
instance of an [fhlog](https://www.npmjs.org/package/fhlog) Logger. If you want 
to view debug output from this module you could do the following:


```javascript

var converter = require('image-converter'),
	cLogger = converter.getLogger()

cLogger.setLogLevel(cLogger.LEVELS.DEBUG);

```
