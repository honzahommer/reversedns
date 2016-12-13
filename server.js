#!/usr/bin/env node

'use strict';

var dns = require('native-dns');

var app = dns.createServer();

var opt = {
  soa: {
    primary: process.env.primary || 'reversedns.@HOST@',
    admin: process.env.admin || 'hostmaster.@HOST@',
    serial: process.env.serial || (new Date().getTime()),
    refresh: process.env.refresh || 1200,
    retry: process.env.retry || 3600,
    expiration: process.env.expiration || 604800,
    minimum: process.env.minimum || process.env.ttl || '@OPT.TTL@',
    ttl: '@OPT.TTL@'
  },
  ttl: process.env.ttl || 60
}

app.on('request', function (req, res) {
  var addr;

  var expr = {
    A: /ip-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/,
    AAAA: /ip-((([a-f0-9]{1,4})?[-](?!-)){7}|(?=(-*-[-a-f0-9]{1,4}--|^([-a-f0-9]{1,4})?--))(([a-f0-9]{1,4})?[-]{1,2}){1,6})[a-f0-9]{1,4}/
  };

  var host = req.question[0].name;

  var name = host;

  var repl = {
    A: '.',
    AAAA: ':'
  };

  var type = req.question[0].type;

  for (var prop in expr) {
    if (addr = name.match(expr[prop]), expr.hasOwnProperty(prop)) {
      if (addr) {
        addr = addr[0];
        host = name.substring(addr.length + 1);

        break;
      } 
    }
  }

  if (type !== 2 && !addr) {
    type = 6;
  }

  switch(type) {
    case 1:  // A
    case 28: // AAAA
      res.answer.push(dns[prop]({
        name: name,
        address: addr.substring(3).replace(/-/g, repl[prop]),
        ttl: ttl,
      })); break;    
    case 2: // NS
      res.additional.push(dns.NS({
        name: host,
        data: 'reversedns.' + host,
        ttl: ttl
      })); break;
    case 6: // SOA
      res.authority.push(dns.SOA({
        name: host,
        primary: soa.primary.replace('@HOST@', host),
        admin: soa.admin.replace('@HOST@', host).replace('@', '.'),
        serial: soa.serial,
        refresh: soa.refresh,
        retry: soa.retry,
        expiration: soa.expiration,
        minimum: soa.minimum.replace('@OPT.TTL@', opt.ttl),
        ttl: soa.ttl.replace('@OPT.TTL@', opt.ttl)
      })); break;
  }

  res.send();
});

app.on('error', function (err, buff, req, res) {
  console.log(err.stack);
  res.send();
});

app.serve(process.env.port || 10053);

