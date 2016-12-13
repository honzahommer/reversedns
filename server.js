#!/usr/bin/env node

'use strict';

var dns = require('native-dns');
var dom = require('parse-domain');

var app = dns.createServer();

var opt = {
  fqdn: process.env.FQDN || 'rns.@FQDN@',
  port: process.env.PORT || 10053,
  ttl: process.env.TTL || 60
}

app.on('request', function (req, res) {
  var addr;

  var expr = {
    A: /ip-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/,
    AAAA: /ip-((([a-f0-9]{1,4})?[-](?!-)){7}|(?=(-*-[-a-f0-9]{1,4}--|^([-a-f0-9]{1,4})?--))(([a-f0-9]{1,4})?[-]{1,2}){1,6})[a-f0-9]{1,4}/
  };

  var name = req.question[0].name;

  var doms = dom(name);

  var fqdn = opt.fqdn.replace('@FQDN@', [doms.domain, doms.tld].join('.'));

  var repl = {
    A: '.',
    AAAA: ':'
  };

  var idns = {
    1: 'A' ,
    28: 'AAAA',
    2: 'NS'
  }

  var cats = (req.question[0].type === 255) ? [1, 2, 28] : [req.question[0].type];

  for(var i = 0; i < cats.length; i++) {
    var cat = cats[i];

    switch(cat) {
      case 1:   // A
      case 28:  // AAAA
        var type = idns[cat];
        var addr = name.match(expr[type]);

        if (addr) {
          res.answer.push(dns[type]({
            name: name,
            address: addr[0].substring(3).replace(/-/g, repl[type]),
            ttl: opt.ttl,
          }));
        } break;
      case 2: // NS
        res.additional.push(dns.NS({
          name: fqdn,
          data: fqdn,
          ttl: opt.ttl
        })); break;
    }
  }

  res.send();
});

app.on('error', function (err, buff, req, res) {
  console.error(err.stack);
  res.status(500).send();
});

app.serve(opt.port);

