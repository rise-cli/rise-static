# Introduction to Rise Static

Rise Static is a CLI that makes deploying static websites on AWS as easy as possible. The inspiration behind this project came from a product Zeit (now known as Vercel) released in 2016 called Now. By typing `now` into the terminal, you could deploy a static website, a nodejs backend, or a docker container. Rise aims to provide the same simplicity Zeit Now provided, but for AWS platform.

## How to install

```bash
npm i -g rise-static
```

## How to deploy a project

`cd` into a project and run the following command in your terminal:

```bash
rise-static deploy
```

## How to remove a project

`cd` into a project and run the following command in your terminal:

```bash
rise-static remove
```

## What a project looks like

A project must have a `static.js` file at the root of the project that looks like the following:

```js
// static.js
module.exports = {
    title: 'Title of Project'
}
```

Rise Static will also assume that the files you want to deploy are in a `dist` folder, which has at least 1 file called `index.html`
