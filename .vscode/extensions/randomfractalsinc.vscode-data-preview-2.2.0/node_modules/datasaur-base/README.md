Abstract base class for **Hypergrid** data models.

The cascading data model consists of a data owner module at the bottom with zero or more data transformer modules attached.

The data owner module should extend from `datasaur-owner` (which extends from this class, `datasaur-base`), while the transformer modules should extend directly from this class.

`datasaur-base@3.0.0` together with datasaur-local3.0.0 implements the [data model interface](https://github.com/fin-hypergrid/core/wiki/Data-Model-API) with fallbacks, superseding `fin-hypergrid-data-source-base` (which will no longer be maintained).

**Hypergrid v2** "data controllers" are no longer supported by **Hypergrid v3** and are no longer supported by the data model. In their place, data models now accept interface setup from the application, which should include a `dispatchEvent` method which data models call to trigger events in Hypergrid and on the application.
