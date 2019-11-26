# express-badbots
Keep Bots And Crawlers Away From Your Express App

This is an updated version of @jeremyscalpello/express-nobots. Since there is no activity for so long, decided to clone and update to fix some minor bugs, update bots list and publish! All credit goes to @jeremyscalpello!

This simple to integrate module uses the user-agent header to determine whether or not a request is made from a bot, and if so, either blocks it or tags the request.

Installation
=====

```bash
npm install express-badbots --save
```

Usage
=====
Make sure to include this as the first middleware!

Blocking Bots (sends 401 unauthorised):
```javascript
var noBots = require('express-badbots');

....

app.use(noBots());
//or
app.use(noBots({block:true}));
```

Tagging Bots (this will set req.isBot to true if a bot makes a request):
```javascript
var noBots = require('express-badbots');

....

app.use(noBots({block:false}));
```

Request from a bot with block set to false:
```javascript
...
console.log(req.isBot);
//true
...
```