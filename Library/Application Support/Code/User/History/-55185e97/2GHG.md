# @personio-web/payroll-view-preliminary-payroll

The Payroll hub (Preliminary Payroll) view.

This view will serve to render the base payroll experience for customers with no payroll integration 
or native payroll solution enabled. Additionally, this view can be extended for payroll integrations. 
The long term plan merging with Personio Payroll Germany is still TBD.



## Location

You can find it under the route `*.personio.de/payroll`

![payroll-hub](./payroll-hub-ui.png)


## Technical memo 

### How to read this project 

This project uses the concept of file colocation. 

```
/src
├── tests
│   ├── components
│   │   └── PayrollHubLayout 
|   |     └── components  
|   |       └── context    # PayrollProvider is located 
│   └── integrations
│       └── preliminary    # one type of integration 
│           ├── hooks      # hooks folders only used by this integration 
│           └── components # components needed by integration
│               └── hooks  # hooks needed by the components
└── PayrollHub.tsx         # entry point exported to the O11
```

Instead of separating components, tests, hooks, and other related files into separate directories based on their types, file colocation groups them by  domain. This approach promotes better code organization and maintainability by keeping logically related code in close proximity.

> :exclamation: Check [Colocation](https://kentcdodds.com/blog/colocation) for more


### How to execute this project 

#### Using the personio chrome extension

You can simply run:

```
pnpm exec nx run payroll:serve:prod-injection
```

That's particularly useful when you need to test the development version against live APIs

#### Executing locally 

In order to run locally, you need to run the orchestrator and the payroll product area in two different servers. 

```
pnpm exec nx run orchestrator:serve
pnpm exec nx run payroll:serve
```

This server the assets from `localhost:4200/payroll`, in order to serve the local payroll you need to click on the tool icon (bottom right) and switch the payroll product-area to serve local assets. 

To make this project easy to maintain we use the concept of [colocation](https://kentcdodds.com/blog/colocation) 

## Codeowner

This view is owned by the PREPAY team, they can be reached in [#cir_prepay_dev].


### UK Payroll dev notes

#### Run in fullstack DX mode
1. Start local `international-service`
2. Start payroll:serve && orchestrator:serve with access token  -- notice employeeId (entityId) and companyId in the curl, if you want to change them:
    1. `MOCK_ACCESS_TOKEN=$(curl "https://mock-id.dev.personio-internal.de/v3/idp/jwt?tenantId=336ab7ef-813f-4643-b4d9-f5f010c0af9a&userId=336ab7ef-813f-4643-b4d9-f5f010c0af9a&expirationMinutes=600000&scopes=openid,personio:*:*&entityId=30877&entityCompanyId=1355607") pnpm nx run payroll:serve`
    2. `MOCK_ACCESS_TOKEN=$(curl "https://mock-id.dev.personio-internal.de/v3/idp/jwt?tenantId=336ab7ef-813f-4643-b4d9-f5f010c0af9a&userId=336ab7ef-813f-4643-b4d9-f5f010c0af9a&expirationMinutes=600000&scopes=openid,personio:*:*&entityId=30877&entityCompanyId=1355607") pnpm nx run serve`
3. Add the feature flag to your local `split.js` [file](https://gitlab.personio-internal.de/personio/frontend/personio-web/-/blob/main/split.js#L19)
```
const flags = {
  'PAYME-101-enable-uk-payroll': 'on',
};
```
4. Open `http://localhost:4200/payroll?hub=gb`
5. If needed, in dev toolbox (wrench in bottom-right), change 'payroll' microfrontend loader to 'local'
6. Also in the dev toolbox in the "Mock Service Worker" tab, change the `listLegalEntitiesHandlers` to `listLegalEntities200Handler__listLegalEntitesUkSuccessResponse` to enable the UK specific legal entities for company 1355607
7. Navigate to the [Manage tab -> Development helpers] to initialize data easily

#### Refresh data fetchers
We use latest openapi spec deployed to software-catalog.
1. Update APIs in [payroll-international-service](https://gitlab.personio-internal.de/personio/payroll/international-service), regenerate openapi docs, merge
 - For quick testing locally, can copy openapi.yaml to the folder in step 2, and change `serviceName` to `local` in `project.json`
2. `pnpm nx run payroll-data-payroll-me:request-sync` (you may see few warnings on requestBody & tests folder missing, ignorable)
