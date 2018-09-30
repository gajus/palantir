# Palantir

[![Travis build status](http://img.shields.io/travis/gajus/palantir/master.svg?style=flat-square)](https://travis-ci.org/gajus/palantir)
[![Coveralls](https://img.shields.io/coveralls/gajus/palantir.svg?style=flat-square)](https://coveralls.io/github/gajus/palantir)
[![NPM version](http://img.shields.io/npm/v/palantir.svg?style=flat-square)](https://www.npmjs.org/package/palantir)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Active monitoring and alerting system using user-defined Node.js scripts.

{"gitdown": "contents"}

## Motivation

Existing monitoring software primarily focuses on enabling visual inspection of service health metrics and relies on service maintainers to detect anomalies. This approach is time consuming and allows for human-error. Even when monitoring systems allow to define alerts based on pre-defined thresholds, a point-in-time metric is not sufficient to determine service-health. The only way to establish service-health is to write thorough integration tests (scripts) and automate their execution, just like we do in software-development.

Palantir is continuously performs user-defined tests and only reports failing tests, i.e. if everything is working as expected, the system remains silent. This allows service developers/maintainers to focus on defining tests that provide early warnings about the errors that are about to occur and take preventative actions when alerts occur.

Palantir decouples monitoring, alerting and reporting mechanisms. This method allows distributed monitoring and role-based, tag-based alerting system architecture.

### Further reading

* [Ensuring good service health by automating thorough integration testing and alerting](https://medium.com/@gajus/d507572a2618)

{"gitdown": "include", "file": "./USAGE.md"}
{"gitdown": "include", "file": "./SPECIFICATION.md"}
{"gitdown": "include", "file": "./RECIPES.md"}
