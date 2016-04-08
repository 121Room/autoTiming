var fs = require('fs');
var request = require('request');
var path = require('path');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var url = require('url');
var utils = require('../util/utils.js');
var Promise = require('es6-promise').Promise;
var EventProxy = require('eventproxy');


var headers = {  
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}
function getData () {
  return new Promise(function (resolve, reject) {
    var data = {};
    data.firstList = [];
    var options = {
      url: 'http://www.mi100.com',
      encoding: null,
      headers: headers
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var html = iconv.decode(body, 'utf-8');
        var $ = cheerio.load(html);
        var firstListLength = $('.cats_ul li').length;
        $('.cats_ul li').each(function (item) {
          data.firstList.push({
            name: $(this).find('a').text().replace(/[^(\u4e00-\u9fa5)\d]+/gi, '').replace(/\(/, ''),
            secondList: []
          })
        })
        $('.cat_iii').each(function (i, item) {
          $(this).find('h4').each(function(j, jtem) {
            data.firstList[i].secondList.push({
              name: $(this).text().replace(/[^(\u4e00-\u9fa5)\d]+/gi, '').replace(/\(/, ''),
              thirdList: []
            })
          })
        })
        $('.cat_iii').each(function (i, item) {
          $(this).find('li').each(function (j, jtem) {
            $(this).find('a').each(function (z, ztem) {
              if ($(this).parent()[0].name == 'li') {
                data.firstList[i].secondList[j].thirdList.push({
                  name: $(this).text().replace(/[^(\u4e00-\u9fa5)\d]+/gi, '').replace(/\(/, ''),
                  urlCataId: $(this).attr('href').substring($(this).attr('href').indexOf('=')+1)
                })
              }
            })
          })
        })
        resolve(data);
      } else {
        console.log(error)
        reject(new Error(error));
      }
    })
  })
}
function getCataUrl (data) {
  return new Promise(function (resolve, reject) {
    var cataIdArr = [];
    data.firstList.forEach(function (item, i) {
      item.secondList.forEach(function (jtem, j) {
        jtem.thirdList.forEach(function (ztem, z) {
          cataIdArr.push({
            cataId: ztem.urlCataId,
            cataPage: 0,
            path: item.name+'/'+jtem.name+'/'+ztem.name
          });
        })
      })
    })
    resolve(cataIdArr);
  })
}
function main () {
  getData()
  .then(function (data) {
    // fs.writeFile('json2.json', JSON.stringify(data), function () {
    //   console.log('create json2 success')
    // })
    return getCataUrl(data);
  })
  .then(function (arr) {
    var ep = new EventProxy();
    ep.after('got_file', arr.length, function (list) {
      var obj = {};
      obj.cataList = list;
      fs.writeFile('cataJson2.json', JSON.stringify(obj), function () {
        console.log('write cataJson success!');
      })
    });
    arr.forEach(function (item, i) {
      var options = {
        url: 'http://www.mi100.com/product/productlist.aspx?ProductCataID='+item.cataId+'&ShowType=1&PageNo=1&PageSize=24',
        encoding: null,
        headers: headers
      }
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var html = iconv.decode(body, 'utf-8');
          var $ = cheerio.load(html);
          var lastHref = $('#fenyeS').children().last().attr('href');
          var pageNum = 0;
          if (lastHref == undefined) {
            pageNum = 0;
          }else if (lastHref.search('javascript') > -1) {
            pageNum = 1;
          } else {
            pageNum = lastHref.substring(lastHref.indexOf('PageNo=')+7, lastHref.indexOf('&PageSize'))
          }
          arr[i].cataPage = pageNum;
          item.cataPage = pageNum;
          ep.emit('got_file', item);
        } else {
          console.log(error)
        }
      })
    })
    
    
    
  })
  .then(function (arr) {
    console.log(arr)
  })
  
}
main();








