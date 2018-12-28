sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Filter, FilterOperator) {
    'use strict';
    var oModel = null;
    var b = null;
    var webAssemblyModule = null;
    var functionsMeta = null;
    return Controller.extend('com.gladimdim.webasmloader.controller.App', {
        onInit: function() {
            this.aSearchFilters = [];
            this.aTabFilters = [];

            fetch('./wasm_math_bg.wasm')
                .then(response =>
                    response.arrayBuffer()
                )
                .then(bytes => {
                    var ast = _webassemblyjs_wasmParser.decode(bytes);
                    var exportedFunctions = ast.body[0].fields.filter(f => f.name !== "memory" && f.type ===
                        "ModuleExport").map(f => f.name);
                    functionsMeta = ast.body[0].fields.filter(f => {
                    	if (f.type === "Func" && exportedFunctions.indexOf(f.name.value) >= 0) {
                    		return true;
                    	} else {
                    		return false;
                    	}
                    });
                    return WebAssembly.instantiate(bytes);
                })
                .then(results => {
                    webAssemblyModule = results.instance;
                    
                    var functions = {
                        "wasmFunctions": functionsMeta.map(exportedFn => {
                                return {
                                    exec: webAssemblyModule.exports[exportedFn.name.value],
                                    name: exportedFn.name.value,
                                    arguments: exportedFn.signature.params,
                                    results: exportedFn.signature.results[0]
                                };
                            })
                    };
                    oModel = new JSONModel(functions);
                    this.getView()
                        .setModel(oModel, "Functions");
                });
        },

        /**
         * Adds a new todo item to the bottom of the list.
         */
        addTodo: function() {
            var oModel = this.getView()
                .getModel();
            var aTodos = jQuery.extend(true, [], oModel.getProperty('/todos'));

            aTodos.push({
                title: oModel.getProperty('/newTodo'),
                completed: false
            });

            oModel.setProperty('/todos', aTodos);
            oModel.setProperty('/newTodo', '');
        },

        /**
         * Removes all completed items from the todo list.
         */
        clearCompleted: function() {
            var oModel = this.getView()
                .getModel();
            var aTodos = jQuery.extend(true, [], oModel.getProperty('/todos'));

            var i = aTodos.length;
            while (i--) {
                var oTodo = aTodos[i];
                if (oTodo.completed) {
                    aTodos.splice(i, 1);
                }
            }

            oModel.setProperty('/todos', aTodos);
        },

        /**
         * Updates the number of items not yet completed
         */
        updateItemsLeftCount: function() {
            var oModel = this.getView()
                .getModel();
            var aTodos = oModel.getProperty('/todos') || [];

            var iItemsLeft = aTodos.filter(function(oTodo) {
                    return oTodo.completed !== true;
                })
                .length;

            oModel.setProperty('/itemsLeftCount', iItemsLeft);
        },

        /**
         * Trigger search for specific items. The removal of items is disable as long as the search is used.
         * @param {sap.ui.base.Event} oEvent Input changed event
         */
        onSearch: function(oEvent) {
            var oModel = this.getView()
                .getModel();

            // First reset current filters
            this.aSearchFilters = [];

            // add filter for search
            var sQuery = oEvent.getSource()
                .getValue();
            if (sQuery && sQuery.length > 0) {
                oModel.setProperty('/itemsRemovable', false);
                var filter = new Filter("title", FilterOperator.Contains, sQuery);
                this.aSearchFilters.push(filter);
            } else {
                oModel.setProperty('/itemsRemovable', true);
            }

            this._applyListFilters();
        },

        onFilter: function(oEvent) {

            // First reset current filters
            this.aTabFilters = [];

            // add filter for search
            var sFilterKey = oEvent.getParameter("key");

            // eslint-disable-line default-case
            switch (sFilterKey) {
                case "active":
                    this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, false));
                    break;
                case "completed":
                    this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, true));
                    break;
                case "all":
                default:
                    // Don't use any filter
            }

            this._applyListFilters();
        },

        _applyListFilters: function() {
            var oList = this.byId("todoList");
            var oBinding = oList.getBinding("items");

            oBinding.filter(this.aSearchFilters.concat(this.aTabFilters), "todos");
        }

    });

});