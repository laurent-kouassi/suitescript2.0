/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
 define([], function () {
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     */
    function pageInit(scriptContext) {
      var url = "https://www.tcmb.gov.tr/kurlar/today.xml";
  
      var response = nlapiRequestURL(url);
      var responseXML = nlapiStringToXML(response.getBody());
      var resData = nlapiSelectNodes(
        responseXML,
        "/*[local-name()='DataSet'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']/*[local-name()='Body'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']/*[local-name()='Cube'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']/*[local-name()='Rate'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']"
      );
  
      resData.forEach(function (entry) {
        var currencyCode = nlapiSelectValue(entry, "@currency");
        var currencyRate = nlapiSelectNode(entry, "text()").textContent;
        var currencyMultiplier = nlapiSelectValue(entry, "@multiplier");
        alert(currencyCode + " " + currencyRate + " " + currencyMultiplier);
      });
    };
  
    return {
      pageInit: pageInit
    };
  });