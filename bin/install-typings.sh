#!/bin/sh -ex

npm install typings --global

typings install --global --save \
    github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Microsoft.Maps.d.ts
typings install --global --save \
    github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Autosuggest.d.ts
typings install --global --save \
    github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Clustering.d.ts
typings install --global --save \
    github:Microsoft/Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Modules/Search.d.ts
