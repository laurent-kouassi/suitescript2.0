
define([
    'N/xml',
    'N/task',
    'N/file'], function (xmlMod, task, file) {
    /**
     * A simple "Hello, World!" example of a Client Script. Uses the `pageInit`
     * event to write a message to the console log.
     *
     * @NApiVersion 2.x
     * @NModuleScope Public
     * @NScriptType ClientScript
     */
    var exports = {};
    function pageInit(context) {

        function xmlToJson(xmlNode) {
            // Create the return object
            var obj = Object.create(null);
        
            if (xmlNode.nodeType == xmlMod.NodeType.ELEMENT_NODE) { // element
                // do attributes
                if (xmlNode.hasAttributes()) {
                    obj['@attributes'] = Object.create(null);
                    for (var j in xmlNode.attributes) {
                        if(xmlNode.hasAttribute({name : j})){
                            obj['@attributes'][j] = xmlNode.getAttribute({
                                name : j
                            });
                        }
                    }
                }
            } else if (xmlNode.nodeType == xmlMod.NodeType.TEXT_NODE) { // text
                obj = xmlNode.nodeValue;
            }
        
            // do children
            if (xmlNode.hasChildNodes()) {
                for (var i = 0, childLen = xmlNode.childNodes.length; i < childLen; i++) {
                    var childItem = xmlNode.childNodes[i];
                    var nodeName = childItem.nodeName;
                    if (nodeName in obj) {
                        if (!Array.isArray(obj[nodeName])) {
                            obj[nodeName] = [
                                obj[nodeName]
                            ];
                        }
                        obj[nodeName].push(xmlToJson(childItem));
                    } else {
                        obj[nodeName] = xmlToJson(childItem);
                    }
                }
            }
        
            return obj;
        };

        //////////////// Don't touch here please : start ////////////////////////

        //  check date path
        function checkFromXmlDateTimePaths(value, childName, fullPath) {
            if(config.datetimeAccessFormPaths.length > 0) {
                var path = fullPath.split("\.#")[0];
                if(checkInStdFiltersArrayForm(config.datetimeAccessFormPaths, value, childName, path)) {
                    return fromXmlDateTime(value);
                }
                else
                    return value;			
            }
            else
                return value;
        };

        // node local name
        function getNodeLocalName( node ) {
            var nodeLocalName = node.localName;			
            if(nodeLocalName == null) // Yeah, this is IE!! 
                nodeLocalName = node.baseName;
            if(nodeLocalName == null || nodeLocalName=="") // =="" is IE too
                nodeLocalName = node.nodeName;
            return nodeLocalName;
        }


        // check xml element
        function checkXmlElementsFilter(obj, childType, childName, childPath) {
            if( childType == DOMNodeTypes.ELEMENT_NODE && config.xmlElementsFilter.length > 0) {
                return checkInStdFiltersArrayForm(config.xmlElementsFilter, obj, childName, childPath);	
            }
            else
                return true;
        };

        // array access form
        function toArrayAccessForm(obj, childName, path) {
            switch(config.arrayAccessForm) {
                case "property":
                    if(!(obj[childName] instanceof Array))
                        obj[childName+"_asArray"] = [obj[childName]];
                    else
                        obj[childName+"_asArray"] = obj[childName];
                    break;
                /*case "none":
                    break;*/
            }
            
            if(!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
                if(checkInStdFiltersArrayForm(config.arrayAccessFormPaths, obj, childName, path)) {
                    obj[childName] = [obj[childName]];
                }			
            }
        };
        
        // get node prefix
        function getNodePrefix(node) {
            return node.prefix;
        };

        // dom children
        function parseDOMChildren( node, path ) {
            if(node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
                var result = new Object;
                var nodeChildren = node.childNodes;
                // Alternative for firstElementChild which is not supported in some environments
                for(var cidx=0; cidx <nodeChildren.length; cidx++) {
                    var child = nodeChildren.item(cidx);
                    if(child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
                        var childName = getNodeLocalName(child);
                        result[childName] = parseDOMChildren(child, childName);
                    }
                }
                return result;
            }
            else
            if(node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
                var result = new Object;
                result.__cnt=0;
                
                var nodeChildren = node.childNodes;
                
                // Children nodes
                for(var cidx=0; cidx <nodeChildren.length; cidx++) {
                    var child = nodeChildren.item(cidx); // nodeChildren[cidx];
                    var childName = getNodeLocalName(child);
                    
                    if(child.nodeType!= DOMNodeTypes.COMMENT_NODE) {
                        var childPath = path+"."+childName;
                        if (checkXmlElementsFilter(result,child.nodeType,childName,childPath)) {
                            result.__cnt++;
                            if(result[childName] == null) {
                                result[childName] = parseDOMChildren(child, childPath);
                                toArrayAccessForm(result, childName, childPath);					
                            }
                            else {
                                if(result[childName] != null) {
                                    if( !(result[childName] instanceof Array)) {
                                        result[childName] = [result[childName]];
                                        toArrayAccessForm(result, childName, childPath);
                                    }
                                }
                                (result[childName])[result[childName].length] = parseDOMChildren(child, childPath);
                            }
                        }
                    }								
                }
                
                // Attributes
                for(var aidx=0; aidx <node.attributes.length; aidx++) {
                    var attr = node.attributes.item(aidx); // [aidx];
                    result.__cnt++;
                    result[config.attributePrefix+attr.name]=attr.value;
                }
                
                // Node namespace prefix
                var nodePrefix = getNodePrefix(node);
                if(nodePrefix != null && nodePrefix != "") {
                    result.__cnt++;
                    result.__prefix=nodePrefix;
                }
                
                if(result["#text"] != null) {				
                    result.__text = result["#text"];
                    if(result.__text instanceof Array) {
                        result.__text = result.__text.join("\n");
                    }
                    //if(config.escapeMode)
                    //	result.__text = unescapeXmlChars(result.__text);
                    if(config.stripWhitespaces)
                        result.__text = result.__text.trim();
                    delete result["#text"];
                    if(config.arrayAccessForm=="property")
                        delete result["#text_asArray"];
                    result.__text = checkFromXmlDateTimePaths(result.__text, childName, path+"."+childName);
                }
                if(result["#cdata-section"]!=null) {
                    result.__cdata = result["#cdata-section"];
                    delete result["#cdata-section"];
                    if(config.arrayAccessForm=="property")
                        delete result["#cdata-section_asArray"];
                }
                
                if( result.__cnt == 0 && config.emptyNodeForm=="text" ) {
                    result = '';
                }
                else
                if( result.__cnt == 1 && result.__text!=null  ) {
                    result = result.__text;
                }
                else
                if( result.__cnt == 1 && result.__cdata!=null && !config.keepCData  ) {
                    result = result.__cdata;
                }			
                else			
                if ( result.__cnt > 1 && result.__text!=null && config.skipEmptyTextNodesForObj) {
                    if( (config.stripWhitespaces && result.__text=="") || (result.__text.trim()=="")) {
                        delete result.__text;
                    }
                }
                delete result.__cnt;			
                
                if( config.enableToStringFunc && (result.__text!=null || result.__cdata!=null )) {
                    result.toString = function() {
                        return (this.__text!=null? this.__text:'')+( this.__cdata!=null ? this.__cdata:'');
                    };
                }
                
                return result;
            }
            else
            if(node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
                return node.nodeValue;
            }	
        };


        function xml2json(xml){
            return parseDOMChildren(xml);
        };

      //////////////// Don't touch here please : end ////////////




        function xmlTocsv(data) {
            var xml = "";
        
            if (data !== null && data.trim().length !== 0) {
        
                try {
                    xml = jQuery.parseXML(data);
                } catch (e) {
                    throw e;
                }
        
                // var x2js = new X2JS();
        
                // data = x2js.xml2json(xml);

                data = xml2json(xml);
                // jsonTocsvbyjson(data);   
            }
        };
        


        function jsonTocsvbyjson(data, returnFlag) {
            arr = [];
            flag = true;
        
            var header = "";
            var content = "";
            var headFlag = true;
        
            try {
        
                var type1 = typeof data;
        
                if (type1 != "object") {
                    data = processJSON(jQuery.parseJSON(data));
                } else {
                    data = processJSON(data);
                }
        
            } catch (e) {
                if (returnFlag === undefined || !returnFlag) {
                    console.error("Error in Convert to CSV");
                } else {
                    console.error("Error in Convert :" + e);
                }
                return false;
            }
        
            jQuery.each(data, function(k, value) {
                if (k % 2 === 0) {
                    if (headFlag) {
                        if (value != "end") {
                            header += value + ",";
                        } else {
                            // remove last colon from string
                            header = header.substring(0, header.length - 1);
                            headFlag = false;
                        }
                    }
                } else {
                    if (value != "end") {
                        var temp = data[k - 1];
                        if (header.search(temp) != -1) {
                            content += value + ",";
                        }
                    } else {
                        // remove last colon from string
                        content = content.substring(0, content.length - 1);
                        content += "\n";
                    }
                }
        
            });
        
            // if (returnFlag === undefined || !returnFlag) {
            //     jQuery("#csvArea").val(header + "\n" + content);
            // } else {
            //     return (header + "\n" + content);
            // }

            return (header + "\n" + content);
        };
        
        function processJSON(data) {
        
            jQuery.each(data, function(k, data1) {
        
                var type1 = typeof data1;
        
                if (type1 == "object") {
        
                    flag = false;
                    processJSON(data1);
                    arr.push("end");
                    arr.push("end");
        
                } else {
                    arr.push(k, data1);
                }
        
            });
            return arr;
        }


        // import csv
        function CSVImport(csv) {
            var mappingFileId = "customrecord_test_exchange_rate";
            // var primaryFile = file.load({
            //     id: 59
            // });
        
            var job = task.create({
                taskType: task.TaskType.CSV_IMPORT,
                importFile: csv,
                mappingId: mappingFileId
            });
        
            //job.mappingId = mappingFileId;
            //job.importFile = csv;
            job.name = 'jobImport';
            job.submit();
        };


        var baseUrl = 'https://www.tcmb.gov.tr/kurlar/today.xml'; // base api url -> xml data
        var data = new FormData();

        var xhr = new XMLHttpRequest();
        var xmlData;

            xhr.withCredentials = false; // true if credentials 
            
            xhr.addEventListener("readystatechange", function() {
                if(this.readyState === 4) {
                    xmlData = this.responseText;
                    var xmlObj = xmlMod.Parser.fromString(xmlData);
                    var jsonObj = xmlToJson(xmlObj.documentElement);

                    // var csv = jsonTocsvbyjson(jsonObj); // json to csv
                    log.debug('jsonObj', jsonObj);
                    // alert(jsonObj);
                    
                    // rate scheduler
                    // var data = JSON.stringify(jsonObj);
                    // log.debug('json stringfy test', data);

                    // var csv = xmlTocsv(xmlData);

                    // CSVImport(csv);
                }
            });
            
            xhr.open("GET", baseUrl);
            xhr.setRequestHeader(
                "Cookie", 
                "TS01ab7d04=015d31d69169836cbd94c101c1d0889d5da665065c51f0eef7dea087dd0183142df765bdc2c495443a8c3701d1ec84bc4310760e4f"
            );
            
            xhr.send(data);
               
    }

    exports.pageInit = pageInit;
    return exports;
});