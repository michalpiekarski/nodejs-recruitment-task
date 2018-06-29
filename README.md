# Movie Database

This is a simple application, for gathering movie, tv show an other information from [OMDB API](http://www.omdbapi.com/), and commenting on the collected data.

You can check out the running application at https://michalpiekarski-moviedb.herokuapp.com/

## Running

There are 2 ways to run the application: locally and inside Docker.

### API KEY

For OMDB API access You will need the API key. You can generate it [HERE](http://www.omdbapi.com/apikey.aspx).
After You obtain Your API key, create the `.env` file with the following contents:

```
API_KEY=your_api_key
```

### Docker

The simplest way is to use Docker for running the application.
To start the application simply run the command below in Your terminal of choice:

```shell
docker-compose up
```

> Make sure You have Docker installed by running `docker info`

Now the app is running and available at `http://localhost:8080`.

### Node

If You're a more advanced user, You can run the application locally.

This method requires a little bit more setup.
Before You can run the application, first You must run redis instance.
You can find more information on how to do that in the [official documentation of redis](https://redis.io/download#installation)

After that run the following commands in Your terminal of choice:

```shell
yarn install
yarn start
```

Now the application is running and availabble at `http://localhost:8080`

## Development

There are some development tools setup too:

* You can lint the code with `yarn lint`
* You can run tests with `docker-compose -f docker-compose-test.yaml up --abort-on-container-exit`
* You can generate test coverage report using `docker-compose -f docker-compose-test.yaml -f docker-compose-cover.yml up --abort-on-container-exit`
