#!/usr/bin/env node

'use strict';

var dns = require('native-dns');
var dom = require('parse-domain');

var app = dns.createServer();

var opt = {
  fqdn: process.env.FQDN || '@FQDN@',
  port: process.env.PORT || 10053,
  soa: {
    primary: process.env.PRIMARY || 'rns.@OPT.FQDN@',
    admin: process.env.ADMIN || 'hostmaster.@OPT.FQDN@',
    serial: process.env.SERIAL || (new Date().getTime()),
    refresh: process.env.REFRESH || 1200,
    retry: process.env.RETRY || 3600,
    expiration: process.env.EXPIRATION || 604800,
    minimum: process.env.MINIMUM || '@OPT.TTL@',
    ttl: '@OPT.TTL@'
  },
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

  var fqdn = opts.fqdn.replace('@FQDN@', [doms.domain, doms.tld].join('.'));

  var repl = {
    A: '.',
    AAAA: ':'
  };

  var type = req.question[0].type;

  for (var prop in expr) {
    if (addr = name.match(expr[prop]), expr.hasOwnProperty(prop)) {
      if (addr) {
        addr = addr[0];

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
        ttl: opt.ttl,
      })); break;    
    case 2: // NS
      res.additional.push(dns.NS({
        name: fqdn,
        data: opt.soa.primary.replace('@OPT.FQDN@', opt.fqdn),
        ttl: opt.ttl
      })); break;
    case 6: // SOA
      res.authority.push(dns.SOA({
        name: fqdn,
        primary: opt.soa.primary.replace('@OPT.FQDN@', opt.fqdn),
        admin: opt.soa.admin.replace('@OPT.FQDN@', opt.fqdn).replace('@', '.'),
        serial: opt.soa.serial,
        refresh: opt.soa.refresh,
        retry: opt.soa.retry,
        expiration: opt.soa.expiration,
        minimum: opt.soa.minimum.replace('@OPT.TTL@', opt.ttl),
        ttl: opt.soa.ttl.replace('@OPT.TTL@', opt.ttl)
      })); break;
  }

  res.send();
});

app.on('error', function (err, buff, req, res) {
  console.log(err.stack);
  res.send();
});

app.serve(opt.port);

