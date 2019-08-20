# Open Source Bitshares Explorer

http://open-explorer.io

## Install

Clone repo:

```
git clone https://github.com/oxarbitrage/open-explorer
cd open-explorer
```

Start development server, explorer will listen in http://localhost:9000:

```
npm start
```

Build bundle and move to www:

```
npm run start:build
cp -rf dist/* /var/www/open-explorer.io/public_html/
```