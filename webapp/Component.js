sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent){
    "use strict";

    var tbl = new WebAssembly.Table({initial:2, element:"anyfunc"});
    fetch('./wasm_math_bg.wasm')
        .then(response =>
              response.arrayBuffer()
             )
        .then(bytes => WebAssembly.instantiate(bytes, {env: tbl}))
        .then(results => {
            var instance = results.instance;
            console.log(tbl);
            console.log(Object.keys(instance.exports));
        })
        .catch(console.error);
    return UIComponent.extend('sap.ui.demo.todo.Component', {
	metadata: {
	    manifest: "json"
	}
    });
});
