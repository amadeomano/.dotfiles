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
