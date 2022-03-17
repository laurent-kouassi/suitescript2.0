/**
 *@NApiVersion 2.0
 *@NScriptType ScheduledScript
 */

  define([
      "N/task", 
      "N/file"], function(task, file) {



         var exports = {};
         function pageInit(context) {

            var scriptTask = task.create({ 
                taskType: task.TaskType.CSV_IMPORT 
            });
        
            scriptTask.mappingId = "customrecord_test_exchange_rate";
            var csv = file.load("SuiteScripts/test.csv");
        
            scriptTask.importFile = csv;
        
            scriptTask.submit();
                  
         }
     
         exports.pageInit = pageInit;
         return exports;
  }


  );
  