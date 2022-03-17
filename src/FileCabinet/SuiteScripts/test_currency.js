/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
 define([
   "N/record", 
   "N/xml", 
   "N/currentRecord", 
   "N/log", 
   "N/https", 
   "N/file", 
   "N/compress", 
   "N/encode"],
 function (
   record, 
   xml, 
   currentRecord, 
   log, 
   https, 
   file, 
   compress,
   encode) {
   function execute(context) {

    var baseUrl = 'https://www.tcmb.gov.tr/kurlar/today.xml'; // base api url -> xml data
    var data = new FormData();

    var xhr = new XMLHttpRequest();
    var xmlData;

        xhr.withCredentials = false; // true if credentials 
        log.debug('test', 'read 1');
        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {

                xmlData = this.responseText;
                var xmlObj = xml.Parser.fromString({text: xmlData});
                // var jsonObj = xmlObj.documentElement;

                // var csv = jsonTocsvbyjson(xmlObj); // json to csv
                // log.debug('jsonObj', csv);

                // var xmlDocument = xml.Parser.fromString({ text: xmlObj });
                // x = xmlDocument.getElementsByTagName("User")[0];
           
              //   var newCurrency = record.create({ // Creating a new SO
              //     type: "customrecord_test_exchange_rate",
              //     isDynamic: true // Important: Dynamic Mode
              //   });


              log.debug('test', 'read 2');



                var xmlNode = xmlObj.getElementsByTagName("Currency");
                var dateNode = xmlObj.getElementsByTagName("Tarih_Date")[0];
           
                log.debug('test', xmlData);

                for (var i = 0; i < xmlNode.length; i++) {
                  log.debug('test', 'read 3');
                  
                  var newCurrency = record.create({ // Creating a new SO
                    type: "customrecord_test_exchange_rate",
                    isDynamic: true // Important: Dynamic Mode
                  });
           
                  
                  log.debug({
                    title: "Isim",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'Isim' })[0].textContent
                  });
           
                  newCurrency.setValue({
                    fieldId: "name",
                    value: xmlNode[i].getElementsByTagName({ tagName: 'Isim' })[0].textContent
                  });
           
                  log.debug({
                    title: "Unit",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'Unit' })[0].textContent
                  });
                  
                  newCurrency.setValue({
                    fieldId: "Unit",
                    value: xmlNode[i].getElementsByTagName({ tagName: 'Unit' })[0].textContent
                  });
           
                  log.debug({
                    title: "CurrencyName",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'CurrencyName' })[0].textContent
                  })
                  newCurrency.setValue({
                    fieldId: "custrecord_currency",
                    value: xmlNode[i].getElementsByTagName({ tagName: 'CurrencyName' })[0].textContent
                  })
                  log.debug({
                    title: "ForexBuying",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'ForexBuying' })[0].textContent
                  })
                  newCurrency.setValue({
                    fieldId: "custrecord_forex_buying",
                    value: xmlNode[i].getElementsByTagName({ tagName: 'ForexBuying' })[0].textContent
                  });
           
                  newCurrency.setValue({
                    fieldId: "custrecord_delta_efat_firstcrea_time",
                    value: convertFromStringToDate(dateNode[0].getElementsByTagName({ tagName: 'Tarih_Date' })[0].textContent)
                  })
           
                  log.debug({
                    title: "ForexSelling",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'ForexSelling' })[0].textContent
                  })
           
                  newCurrency.setValue({
                    fieldId: "custrecord_forex_selling",
                    value: xmlNode[i].getElementsByTagName({ tagName: 'ForexSelling' })[0].textContent
                  })
           
                  log.debug({
                    title: "BanknoteBuying",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'BanknoteBuying' })[0].textContent
                  })
           
                  newCurrency.setValue({
                   fieldId: "custrecord_banknote_buying",
                   value: xmlNode[i].getElementsByTagName({ tagName: 'BanknoteBuying' })[0].textContent
                 });
           
                 log.debug({
                   title: "BanknoteSelling",
                   details: xmlNode[i].getElementsByTagName({ tagName: 'BanknoteSelling' })[0].textContent
                 })
           
                 newCurrency.setValue({
                  fieldId: "custrecord_banknote_selling",
                  value: xmlNode[i].getElementsByTagName({ tagName: 'BanknoteSelling' })[0].textContent
                });
           
                  log.debug({
                    title: "CrossRateUSD",
                    details: xmlNode[i].getElementsByTagName({ tagName: 'CrossRateUSD' })[0].textContent
                  })
           
                  newCurrency.setValue({
                   fieldId: "custrecord_delta_efat_alias_creatime",
                   value: xmlNode[i].getElementsByTagName({ tagName: 'CrossRateUSD' })[0].textContent
                 });
           
                 log.debug({
                   title: "CrossRateOther",
                   details: xmlNode[i].getElementsByTagName({ tagName: 'CrossRateOther' })[0].textContent
                 })
           
                 newCurrency.setValue({
                  fieldId: "custrecord_delta_efat_alias_creatime",
                  value: xmlNode[i].getElementsByTagName({ tagName: 'CrossRateOther' })[0].textContent
                });
           
                try {
                    var newCurrrencyID = newCurrency.save(); // Attempting to save the record
                    log.debug("New currency ID", newCurrrencyID)
                } catch (e) {
                    log.error("Not able to save new Currency - " + e.name, e.message);
                }
              }
            }
        });
        
        xhr.open("GET", baseUrl);
        xhr.setRequestHeader(
            "Cookie", 
            "TS01ab7d04=015d31d69169836cbd94c101c1d0889d5da665065c51f0eef7dea087dd0183142df765bdc2c495443a8c3701d1ec84bc4310760e4f"
        );
        
        xhr.send(data);

   }

   function convertFromStringToDate(responseDate) {

     var dateComponents = responseDate.split('T');
     var datePieces = dateComponents[0].split("-");
     var timePieces1 = dateComponents[1].split("+");
     var timePieces = timePieces1[0].split(":");

     return (
       new Date(
         datePieces[0],
         datePieces[1],
         datePieces[2],
         timePieces[0],
         timePieces[1],
         timePieces[2])
      )
   };

   return {
     execute: execute
   }
 });




                            
              //   newCurrency.setValue({
              //     fieldId: "name",
              //     value: 111
              //   });
         
              //   log.debug({
              //     title: "Unit",
              //     details: 111
              //   });
                
              //   newCurrency.setValue({
              //     fieldId: "Unit",
              //     value: 111
              //   });
         
              //   log.debug({
              //     title: "CurrencyName",
              //     details: 111
              //   })
              //   newCurrency.setValue({
              //     fieldId: "custrecord_currency",
              //     value: 111
              //   })
              //   log.debug({
              //     title: "ForexBuying",
              //     details: 111
              //   })
              //   newCurrency.setValue({
              //     fieldId: "custrecord_forex_buying",
              //     value: 111
              //   });
         
              //   newCurrency.setValue({
              //     fieldId: "custrecord_delta_efat_firstcrea_time",
              //     value: 111
              //   })
         
              //   log.debug({
              //     title: "ForexSelling",
              //     details: 111
              //   })
         
              //   newCurrency.setValue({
              //     fieldId: "custrecord_forex_selling",
              //     value: 111
              //   })
         
              //   log.debug({
              //     title: "BanknoteBuying",
              //     details: 111
              //   })
         
              //   newCurrency.setValue({
              //    fieldId: "custrecord_banknote_buying",
              //    value: 111
              //  });
         
              //  log.debug({
              //    title: "BanknoteSelling",
              //    details: 111
              //  })
         
              //  newCurrency.setValue({
              //   fieldId: "custrecord_banknote_selling",
              //   value: 111
              // });
         
              //   log.debug({
              //     title: "CrossRateUSD",
              //     details: 111
              //   })
         
              //   newCurrency.setValue({
              //    fieldId: "custrecord_delta_efat_alias_creatime",
              //    value: 111
              //  });
         
              //  log.debug({
              //    title: "CrossRateOther",
              //    details: 111
              //  })
         
              //  newCurrency.setValue({
              //   fieldId: "custrecord_delta_efat_alias_creatime",
              //   value: 111
              // });
