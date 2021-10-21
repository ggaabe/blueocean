## Description

Built with nest.js; 

The caching strategy checks the cache first for books and characters (cheapest), then checks database (cheap), then makes a network request (expensive).

This project relies on MySQL; set up a database, then configure the database settings in `ormconfig.json`.

## Setup

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start
```

