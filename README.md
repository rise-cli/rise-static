# Introduction to Rise Static

Rise Static is a CLI that makes deploying static websites on AWS as easy as possible. Optimizing for a particular build process or framework may cause this CLI to become out of date very quickly. Here is a timeline of build steps and frameworks which demonstrates the continued churn this community is experiencing:

### Build Tools:
- Browserify - 2011
- Grunt - 2012
- Bower - 2012
- Gulp - 2013
- Babel - 2014
- Webpack - 2014
- Rollup - 2015
- Parcel - 2017
- SWC - 2019
- Vite - 2020
- ESBuild - 2020
- Turbopack - 2022

### Common Frontend frameworks used today
- React
- Svelte
- Angular
- Vue
- Solid
- Astro
- Alpine
- Ember
- Stimulus
- Lit
- Preact
- Qwik
- Eleventy

Because of the diversity in this space, this CLI focuses on deploying a folder containing html, css, and js. This allows a user to use any build step and framework they want.

## How to install

```js
npm i -g rise-static
```

## How to deploy a project

`cd` into a project and run the following command in your terminal:

```js
rise-static deploy
```

## How to remove a project

`cd` into a project and run the following command in your terminal:

```js
rise-static remove
```

## What a project looks like

A project must have a `rise.mjs` file at the root of the project that looks like the following:

```js
// rise.js
export default {
    name: 'Name of Project',
    dist: 'build', //  optional
    auth: {
        // optional
        username: 'my-user-name',
        password: 'my-password-that-is-at-least-8-characters'
    }
}
```

If your dist folder is not defined in a `rise.mjs` config, Rise Static will assume that the files you want to deploy are in a `dist` folder, which has at least 1 file called `index.html`

## Connecting to a backend

It is common to reference backend endpoints and authentication service ids in the build step of a frontend project.

For an AWS serverless backend, this often means referencing the endpoint of an ApiGateway, and the id of Cognito user pools. This can be achieved by defining `backendStack` and `env` properties in the project config like so:
```js
// rise.js
export default {
    name: 'Name of Project',
    backendStack: 'myCloudFormationStackName',
    env: {
        VITE_ENDPOINT: 'MyApi',
        VITE_POOL: 'MyCognitoPool'
    }
}
```

When running `rise-static pull`, the cli wll look at the backendStackthe. In this case it will query `myCloudFormationStackName` stack. It will then look for the `Api` resource. If its an ApiGateway resrouce, it will grab the endpoint. If its a cognito resource, it will grab the id. It will then write a `.env` file to the root of your project like so:

```
VITE_ENDPOINT=https://23j2342.com
VITE_POOL=23j23o42342j34
```

This will allow your frontend build step to inject these values into the build.