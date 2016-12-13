# reversedns
> Wildcard reverse DNS server.

## Install & Running

### Linux host (postinstall not works on Windows)

```bash
git clone https://github.com/honzahommer/reversedns.git && \
cd reversedns && \
npm install && \
npm start
```

### PM2 (Node.js process manager)

```bash
git clone https://github.com/honzahommer/reversedns.git && \
cd reversedns && \
npm install && \
pm2 startOrRestart ecosystem.config.js
```

## Env config variables

* port -- number (default 10053)
* primary -- string (default reversedns.`%HOST%`)
* admin -- string (default hostmaster.`%HOST%`)
* serial -- number (actual timestamp)
* refresh -- number (default 1200)
* retry -- number (default 3600)
* expiration -- number (default 604800)
* minimum -- number (default `ttl` or 60)
* ttl -- number (default 60)

**%HOST% is replaced with domain address parsed from request name.**

## Endpoints

```
dig ip-10-10-10-11.foo.bar @127.0.0.1 A
dig ip-0000-0000-0000-0000-0000-0000-0000-0001.foo.bar @127.0.0.1 AAAA
dig foo.bar @127.0.0.1 NS
dig foo.bar @127.0.0.1 SOA
```
