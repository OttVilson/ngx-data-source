# NgxDataSource
The library is an implementation of the [DataSource](https://github.com/angular/components/blob/master/src/cdk/collections/data-source.ts) used by e.g. [Angular Material table](https://material.angular.io/components/table/overview#datasource). The library allows a developer to connect page change, page size change, sorting, filtering and dynamically pushing new data into one DataSource which takes care of paginator state, as well as of course sorting and filtering.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.7.

# How to use

* Clone the repository via `git clone git@github.com:OttVilson/ngx-data-source.git`
* navigate into the created folder via `cd ngx-data-source`
* run `npm install`
* run `ng build`
* navigate to `cd ./dist/ngx-data-source/`
* run `npm link` (as per https://indepth.dev/posts/1193/create-your-standalone-angular-library-in-10-minutes)
* navigate to the project where you want to use the library (might be a project for another library as e.g. [ngx-data-source-material-plugins](https://github.com/OttVilson/ngx-data-source-material-plugins)), and run `npm link ngx-data-source`.
