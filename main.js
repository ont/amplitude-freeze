var system = require('system');
var fs = require('fs');
var data = JSON.parse(fs.read('/srv/config.json'));
var casper = require('casper').create({
    viewportSize: {
        width: 1920,
        height: 1080,
    }
});
phantom.cookiesEnabled = true;

casper.start('https://analytics.amplitude.com/login');
casper.waitForSelector("#login-button", function(){
    this.fillSelectors('form.login-form', {
        '#login-email': system.env.AMPFREEZE_LOGIN,
        '#login-password': system.env.AMPFREEZE_PASSW,
    }, true);
}, function(){}, 20000);

casper.waitWhileSelector("#login-button", function(){
    console.log("logged in!");
}, function(){}, 20000);

data.forEach(function(group){
    group.graphs.forEach(function(graph){
        casper.thenOpen(graph.url);
        casper.waitForSelector('.highcharts-container', function(){
            console.log('[i] extracting "' + graph.title + '" ...');
            var res = extractHtml(this);
            graph.links = res.links;
            graph.html = res.html;
        }, function(){}, 20000);
    });
});

casper.then(function(){
    console.log("all data collected!");

    var links = {};
    data.forEach(function(group){
        group.graphs.forEach(function(graph){
            graph.links.forEach(function(url){
                links[url] = true;
            });
        });
    });

    var styles = [];
    for(url in links){
        styles.push('<link rel="stylesheet" type="text/css" href="' + url + '"/>');
    }

    var head = '<html><head><meta charset="UTF-8">' +
           styles.join('\n') +
           '</head><body><div>';

    var tabsCSS = getTabsCSS();

    var tabsHTML = '<div class="tabs-widget"><div class="header">';
    tabsHTML += data.map(function(group, i){
        return '<a href="#tab-' + i + '">' + group.group + '</a>';
    }).join('\n');

    tabsHTML += '</div><div class="content">';
    data.forEach(function(group, i){
        tabsHTML += '<div class="scroller" id="tab-' + i + '"></div>';
        var htmls = group.graphs.map(function(graph){
            return '<h2>' + graph.title + '</h2>' + graph.html;
        });
        tabsHTML += '<div class="item">' + htmls.join('\n') + '</div>'
    });
    tabsHTML += '</div></div>';

    var stampHTML = "<pre>" + (new Date) + "</pre>";

    fs.write("/srv/html/index.html", head + tabsCSS + tabsHTML + stampHTML + '</div></body></html>', 'w');
});

function extractHtml(casper) {
    var links = casper.evaluate(function(){
        var links = [];
        var sheets = document.styleSheets;
        for(var i = 0; i<sheets.length; i++){
            if(!sheets[i].disabled && sheets[i].href != null) {
                if(sheets[i].rules == null){
                    links.push(sheets[i].href);
                }
            }
        }
        return links;
    });

    var html = casper.evaluate(function(){
        return document.querySelector('[class^=ChartView__chart-container]').outerHTML;  // class starts with ChartVie...
    });

    return {links: links, html: html};
}


function getTabsCSS() {
    // SEE: https://canonium.com/articles/tabs-using-only-css
    return '<style type="text/css">.tabs-widget,.tabs-widget>.content{position:relative}.tabs-widget>.header:after,.tabs-widget>.header:before{display:table;content:""}.clearfix:after,.tabs-widget>.header:after{clear:both}.tabs-widget>.header{background-color:#3f51b5}.tabs-widget>.header a{float:left;padding:10px 20px;color:#fff}.tabs-widget>.header a:focus,.tabs-widget>.header a:hover{background-color:#32408f}.tabs-widget>.content>.scroller{display:none}.tabs-widget>.content>.scroller:target+.item{display:block;left:0;right:0;top:0;bottom:0;z-index:2}.tabs-widget>.content>.scroller:target+.item.-default{position:relative}.tabs-widget>.content>.item{background-color:#fff;color:#333;padding:20px;display:none;overflow-y:auto}.tabs-widget>.content>.item.-default{display:block;z-index:1}</style>';
}

casper.run();
