# Web SDK - TruCode

A JavaScript library for rendering TruCodes used for identifying Trusona enabled devices.

## Requirements
The Trusona Web SDK is supported by the following browsers:

- Internet Explorer 10 or higher
- Microsoft Edge (latest version)
- Google Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)

## Installation

### From the Trusona CDN

Include the trucode.js script tag before the `</body>` of your document

```html
  <!-- existing content -->
  <script type="text/javascript"src="https://static.trusona.net/web-sdk/js/trucode-1.0.7.js"></script>
  </body>
</html>
```


### As an NPM package

```bash
npm install --save trusona-trucode
```

Import it with:

```javascript
const Trusona = require('trusona-trucode')
```

## Usage

Given this HTML:

```html
  <div id="tru-code">
  </div>
```

And this Javascript on the same page:

```javascript
  var handlePaired = function(truCodeId) {
    // The truCodeId that was scanned by a Trusona enabled device. Send this to your backend so they can figure out the deviceIdentifier.
  };

  var handleError = function() {
    // If an error occurred fetching the TruCode and/or it could not be rendered.
  };

  Trusona.renderTruCode({
    truCodeConfig: {
      truCodeUrl: 'https://api.trusona.net',
      relyingPartyId: '<YOUR_RELYING_PARTY_ID>',
      qr: {}
    },
    truCodeElement: document.getElementById('tru-code'),
    onPaired: handlePaired,
    onError: handleError
  });
```

Then an SVG representation of a QR Code will be drawn using default colors and animated using the default animation parameters.

### Options

|         Name          | Required | Default      |                                           Description                                                                                         |
| :-------------------- | :------: | :----------: | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `truCodeConfig`       |    Y     |  null        | The configuration for the fetching and rendering of TruCodes. Is provided by the Server SDK.                                                  |
| `truCodeUrl`          |    Y     |  null        | The Trusona API URL where to fetch TruCodes from.                                                                                             |
| `relyingPartyId`      |    Y     |  null        | The Trusona issued relying party ID that has been assigned to your company.                                                                   |
| `qr`                  |    N     |  see below   | The configuration for rendering TruCodes (colors, width, animations, etc).                                                                    |
| `truCodeElement`      |    Y     |  null        | The DOM element to contain the rendered TruCodes.                                                                                             |
| `onPaired`            |    Y     |  null        | The callback function to call when a TruCode has been scanned. It will be passed a string parameter containing the TruCodeId that was paired. |
| `onError`             |    Y     |  false       | The callback function to call if an error occurred fetching or rendering TruCodes.                                                            |

### QR Options

An optional parameter allows for customization of the SVG drawing.

* Shape Colors
* Dot Color
* Container Width
* Animation Configuration

### Shape Colors

An array of HEX color codes can be used to specify the colors to be used when drawing the SVG.

Default:
```javascript
  ["#000"]
```

Custom:
```javascript
  var qrConfig = {shapeColors: ["#0f0", "#f00", "#00f"]};

  Trusona.renderTruCode({
    truCodeConfig: {
      truCodeUrl: 'https://api.trusona.net',
      relyingPartyId: '<YOUR_RELYING_PARTY_ID>',
      qr: qrConfig
    },
    truCodeElement: document.getElementById('tru-code'),
    onPaired: handlePaired,
    onError: handleError
  });
```

### Dot Color

A single HEX color code can be used to specify the color of any individual dots drawn in the SVG.

Default:
```javascript
"#000"
```

Custom:
```javascript
  var qrConfig = {dotColor: "#0f0"};

  Trusona.renderTruCode({
    truCodeConfig: {
      truCodeUrl: 'https://api.trusona.net',
      relyingPartyId: '<YOUR_RELYING_PARTY_ID>',
      qr: qrConfig
    },
    truCodeElement: document.getElementById('tru-code'),
    onPaired: handlePaired,
    onError: handleError
  });
```
