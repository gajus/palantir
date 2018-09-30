## Usage

### `monitor` program

`monitor` program continuously performs user-defined tests and exposes the current state via [Palantir HTTP API](#palantir-http-api).

```bash
$ palantir monitor --service-port 8080 --configuration ./monitor-configuration.js ./tests/**/*

```

Every test file must export a function that creates a `TestSuiteType` (see [Palantir test suite](#palantir-test-suite)).

* Refer to [Palantir test](#palantir-test) specification.
* Refer to [Monitor configuration](#monitor-configuration) specification.

### `alert` program

`alert` program subscribes to [Palantir HTTP API](#palantir-http-api) and alerts other systems using user-defined configuration.

```bash
$ palantir alert --configuration ./alert-configuration.js --api-url http://127.0.0.1:8080/

```

* Refer to [Alert configuration](#alert-configuration) specification.

### `report` program

`report` program creates a web UI for the [Palantir HTTP API](#palantir-http-api).

```bash
$ palantir report --service-port 8081 --api-url http://127.0.0.1:8080/

```

### `test` program

`test` program runs tests once.

```bash
$ palantir test --configuration ./monitor-configuration.js ./tests/**/*

```

`test` program is used for test development. It allows to filter tests by description (`--match-description`) and by the test tags (`--match-tag`), e.g.

```bash
$ palantir test --match-description 'event count is greater' --configuration ./monitor-configuration.js ./tests/**/*
$ palantir test --match-tag 'database' --configuration ./monitor-configuration.js ./tests/**/*

```
