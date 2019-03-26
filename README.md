#k ( kp-core )
A promise oriented typescript connect/express inspired framework for responsive, browser/api driven web applications.

## Getting Started

Copy `./app/secrets.example.json` to `./app/secrets.json` and enter appropriate details

Then, run the app:
```bash
$ cd ./app/
$ ts-node app.ts
```

## Base Middleware

`Passport` a wrapper for Passportjs allowing for oauth and social logins \
`URLEncode` a wrapper for urlencode to get query parameters from request \
`CookieSession` a wrapper for cookie-session allowing access to request cookies \
`Collections` pure api for interacting with schema defined database objects \
`IAM` internal user, role, and permissions layer

### Core and Layers
Just as connect and express funamentalized the 

License: MIT \
With love, from Dallas