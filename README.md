## Description

Built with nest.js; Uses a microservices architecture with dependency injection for caching management, HTTP services, and model retrieval. An ORM is used for all database interactions.

The caching strategy checks the cache first for books and characters (cheapest), then checks database (cheap), then makes a network request (expensive).

This project relies on MySQL; set up a database, then configure the database settings in `ormconfig.json`.

The `/books` endpoint simply hits the GoT API directly;

The `/books/:id` endpoint will perform the caching strategy and store the result, along with IDs linking to the characters for later lookup.

The `/books/:id/characters` will retrieve the characters for the book, using the characters service.

## Setup

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start
```

