# International Payroll Service

**TEAM:** Payroll Market Expansion (PAYME)

Service for International Payroll.

## Operations

### K8s Dashboard

-   [dev](https://app.datadoghq.eu/dash/integration/208/kubernetes-pods-overview?tpl_var_deployment=international-service-primary&tpl_var_namespace=dev&live=true)

### Logs

-   [dev](https://app.datadoghq.eu/logs?query=service%3Ainternational-service%20env%3Adev&cols=host%2Cservice&index=%2A&messageDisplay=inline&stream_sort=time%2Cdesc&viz=stream&live=true)

## Development

### Run/Debug

#### Local Database Setup

Install Postgres:

```shell
brew install postgresql@14
brew services start postgresql@14
```

Add `$(brew --prefix)/opt/postgresql@14/bin` to your `$PATH` variable.

Create the user and database:

```shell
createuser personio
createdb payroll-international-service
```

#### Running from IDE

Add the following env vars to your `Application` _Run / Debug Configuration_:

```sh
ENVIRONMENT=local;
SPRING_PROFILES_ACTIVE=local;
SERVER_PORT=8080;
INTERNAL_MONOLITH_ACCESS_TOKEN=?????;
```

Optionally:

```shell
INPUT_DATA_SERVICE_TIMEOUT=10000;
```

#### Running standalone

Set the variables above and run the `bootRun` command:

```sh
ENVIRONMENT=local SPRING_PROFILES_ACTIVE=local SERVER_PORT=8080 ./gradlew bootRun
```

#### Data setup

To be able to run payroll we need to be able to have the Personio compensations mapped with our internal compensation schemas
so we can apply the right taxation. In order to do this we first need to populate the employer schemas locally

We do have a convenient endpoint for creating the default employer compensations schemas see `/example/schemas.http`.

Once you have created the default schemas, you'll need to add some mapping between the Personio compensation types and our
employer schemas we just created. We do include an example in the same file but the ids depend on the company you are testing,
so make sure the ids are modified before running the script

See [Internal Monolith Access Token](https://software-catalog.tools.personio-internal.de/docs/default/component/tpf-docs/build/kotlin-dev/how-to/internal-monolith-access-token/)
for how to get the value of `INTERNAL_MONOLITH_ACCESS_TOKEN`.

### Postman

There is a postman collection in the `postman/collection` folder and an environment configuration
json in `postman/env`. You can import those files directly on your [Postman](https://www.postman.com/) and use the API endpoints.

Make sure you specify the following env variables in `Environments > Prototype Env > [Save] (!!)`:

```
company_id
auth_client_id
auth_client_secret
```

The payroll run endpoint will need a valid **access token to perform requests** to reach to IDS. A
Postman pre-request script has been created and should handle this automatically, however, for this
to work, **a client secret to obtain and refresh the token must be defined in the environment
variables**.

Execute the following to obtain the client secret value:

`aws-vault exec dev -- aws secretsmanager get-secret-value --secret-id=s2s/id_oauth_client-data_access`

Use the values of `client_id` and `client_secret` (contained within `SecretString`) to update
Postman environment variables `auth_client_id` and `auth_client_secret`, respectively.

Please note that **anonymous endpoints** (`@AnonymousEndpoint`) should be configured individually in
Postman as `No Auth` under the `Authorization` tab. The default authorization value when creating a
new request is `Inherit from parent`, which will include the access token and may fail for anonymous
requests. See the `liveness` and `readiness` endpoints for reference.

### Jasper

We use [Jasper](https://www.jaspersoft.com/products/jaspersoft-community) to generate documents
(e.g. Payslips). After downloading/installing Jasper Studio, import the `jasper` folder. When you
try to preview a report, make sure to select the right data-adapter (empty data-adapter will be
selected by default). Useful files:

-   [Reports](src/main/resources/jasper)
-   [Java Bean Data Adapters](src/jasper/java/com/personio/payroll/international/jasper)
-   [Java Bean Data Sources](src/main/java/com/personio/payroll/international/jasper)

See also [German Jasper Reports](https://personio.atlassian.net/wiki/spaces/PP/pages/3216114423/Jasper+Reports).

### OpenAPI / Swagger

We generate OpenAPI spec from code annotations as a documentation step.

-   Automatic local [Swagger UI](http://localhost:8080/swagger-ui/index.html)

Currently, run manually to update git-committed docs:

```sh
./gradlew generateOpenApiDocs
```

If the service is already running locally, it will use that instance to build docs. Two implications:

-   If docs aren't updating, reload or kill locally running service
-   If the command line times out, can speed up/debug by starting the service separately

### Exposing endpoints to Web Gateway

To expose a endpoint to web gateway to be available from the browser:

1. Add `@GatewayWeb` annotation + `operationId` in `@Operation` annotation
2. Regenerate OpenApi docs (see above)
3. Manually update gateway configuration: `./gradlew publishPAPICrd -PeksContext=dev`. _This step is only needed while we are not deployed to production, later the pipelines will run it automatically._
4. Confirm API is exposed by looking for it in `https://athena-gateway.dev.personio-internal.de/gateway/routes`
