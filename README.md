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


## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
