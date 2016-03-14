// var path           = require('path')
// var templateDir   = path.join(__dirname, 'templates', 'pasta-dinner')
var template = require('art-template');
var data = {
    list: [
          {
            url: 'pappa.pizza@spaghetti.com',
            length: 1,
            imageCount: []
          },
          {
            url: 'mister.geppetto@spaghetti.com',
            length: 12,
            imageCount: ['asds', 'asdass']
          }
        ]
};

var html = template('./views/email-img/html', data);
console.log(html);


