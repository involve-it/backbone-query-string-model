# backbone-query-string-model
Very simple QueryString Model for Backbone, providing two way binding with browser url query string. 
Power: control browser queryString through common Model methods: set, get and 'change:..' events.

## Requirements:
- Backbone as a global variable
- Backbone-history (https://github.com/involve-it/backbone-history) - to be able to get previous route.
- Ramda (http://ramdajs.com/) - used only few times, will not be called unless qsNames constructor parameter is used. Easy to remove.

## Usage:
- Constructor Params:
  - silently (default false) - do not trigger Backbone route change event
  - qsNames (default []) - white-listed queryString parameters
- Example:
  - Model to Url:
```
// create model:
var queryStringModel = new QueryStringModel();
queryStringModel.set('tab1', 1); // adding parameter, results in your browser url '.../page1?tab1=1;
queryStringModel.set('tab2', 2); // adding parameter,  results in your browser url '.../page1?tab1=1&tab2=2;
queryStringModel.set('tab2', 3); // changing parameter,  results in your browser url '.../page1?tab1=1&tab2=3;
queryStringModel.set('tab1', null); // removing parameter,  results in your browser url '.../page1?tab2=3;
```
  - Url to Model:
```
this.listenTo(queryStringModel, 'change:tab1', (m) => {
  // do something, considering new tab1 query string parameter value:
  tabsView.render(m.get('metricsTab'));
});
```

## Small Note:
I put this code very quickly, without fully testing outside of my projects, so can be few errors/quesions. 
Please let me know and I will definetely work on it when I see the project is used! 
