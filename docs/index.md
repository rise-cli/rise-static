# Introduction to Rise Static

Rise Static is a CLI that makes deploying static websites on AWS as easy as possible. The inspiration behind this project came from a product Zeit (now known as Vercel) released in 2016 called Now. By typing `now` into the terminal, you could deploy a static website, a nodejs backend, or a docker container. Rise aims to provide the same simplicity Zeit Now provided, but for AWS platform.

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

A project must have a `rise.js` file at the root of the project that looks like the following:

```js
// rise.js
module.exports = {
    name: 'Name of Project',
    dist: 'build',  //  optional
    auth: {         // optional
        username: 'my-user-name',
        password: 'my-password-that-is-at-least-8-characters'
    }
}
```

If your dist folder is not defined in a `rise.js` config, Rise Static will assume that the files you want to deploy are in a `dist` folder, which has at least 1 file called `index.html`
