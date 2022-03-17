/**
 *@NApiVersion 2.0
 *@NScriptType ScheduledScript
 */
 define(["N/log"], function(log) {

    function execute(context) {
        log.debug({title : 'test', details :'test' })
    }

    return {
        execute: execute
    }
});