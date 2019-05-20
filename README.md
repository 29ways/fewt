# fewt

[![Version](https://img.shields.io/npm/v/fewt.svg)](https://npmjs.org/package/@29ways/fewt)
[![Downloads/week](https://img.shields.io/npm/dw/fewt.svg)](https://npmjs.org/package/@29ways/fewt)
[![License](https://img.shields.io/npm/l/fewt.svg)](https://github.com/29ways/fewt/blob/master/package.json)

A simple command that uses puppeteer to request a URL and calculates the total volume of resources downloaded as a result.

The results are grouped by resource type. By default values are returned in KB.

## Example

`fewt -u https://google.com`

```
Url                Html  Num html Css    Num css Js     Num js Img     Num img Fonts  Num fonts All     Num all
https://google.com 66.84 5        0.00   0       285.24 4      49.36   5       0.00   0         401.44  14
```

You can request multiple URLs at the same time

`fewt -u https://google.com https://github.com`

```
Url                Html  Num html Css    Num css Js     Num js Img     Num img Fonts  Num fonts All     Num all
https://google.com 66.84 5        0.00   0       285.24 4      49.36   5       0.00   0         401.44  14
https://github.com 24.60 1        104.24 3       167.58 2      3331.59 40      314.28 2         3942.79 49
```

## Options

Option | Details
-------|--------
-u     | Required. Use this to specify the URLs to test
-b     | Report in bytes rather than KB.
--csv  | Output results in CSV format. This avoids truncation of long URLs and makes for easy pasting into a spreadsheet.

Built using [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
