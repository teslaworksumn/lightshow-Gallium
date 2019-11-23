
var fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
const rgbHex = require('rgb-hex');

var parser = require('fast-xml-parser');

var arguments = process.argv.slice(2);
var timFile = arguments[0];
var configFile = arguments[1];
var modulesFile = arguments[2];
var timeInterval = arguments[3]


var options = {
    ignoreAttributes: false,
};

// Get data from .tim file
var sequenceData = fs.readFileSync(timFile).toString();
var sequenceDataJson = parser.parse(sequenceData,options);

// Get data from SystemConfig.xml file
var config = fs.readFileSync(configFile).toString();
var configDataJson = parser.parse(config,options);

// Get data from ModuleStore.xml file
var modulesData = fs.readFileSync(modulesFile).toString();
var modulesDataJson = parser.parse(modulesData,options);


// module functions
var modulesArray = [];
var singleColorDict = {};
var moduleColorInstanceId = getModuleColorInstanceIdAndSingleColorMap(modulesDataJson,singleColorDict)
getColorModules(modulesDataJson, modulesArray, singleColorDict)

// node functions
var nodes = [];
getNodes(configDataJson, nodes, modulesArray, moduleColorInstanceId);
patchBullshit(configDataJson, nodes);

//event functions
getEvents(sequenceDataJson, nodes);
addEventsToChildren(nodes);


//csv functions
var csvArray = [];
makeBlankCSVArray(sequenceDataJson, csvArray);
writeEventsToCSV(nodes, csvArray)
saveCSV("test.csv", csvArray );




// Data Structures
function Node(name, id, color) {
    this.name = name;
    this.id = id;
    this.csv_row;
    this.channelId;
    this.children = [];
    this.instanceId;
    this.color = color;
    this.events = [];
}

function Modules(instanceId, colors) {
    this.instanceId = instanceId;
    this.colors = colors;
}

function Event(nodeId, startTime, endTime, type, attributes, eventNumber) {
    this.nodeId = nodeId;
    this.eventNumber = eventNumber;
    //this.name;
    this.startTime = startTime;
    this.endTime = endTime;
    this.type = type;
    this.attributes = attributes;
    this.instanceId;
    this.colors; // RGBW??
}

// Modules

// Get predefined colors from ModuleStore.xml and get InstanceId for the rest of the color elements
function getModuleColorInstanceIdAndSingleColorMap(modulesDataJson, singleColorDict) { // rename
    var modules = modulesDataJson["ModuleStore"]["ModuleData"][0]["Module"];
    for (let i = 0; i < modules.length; i++) {
        if (modules[i]["ColorStaticData"]) {
            var colorSets = modules[i]["ColorStaticData"]["ColorSets"]['a:KeyValueOfstringArrayOfColor3odnvp_PE'];
            if (colorSets) {
                for (let j = 0; j < colorSets.length; j++) {
                    var colors = colorSets[j]['a:Key'].split("");
                    for (var k = 0; k < colors.length; k++ ) {
                        singleColorDict[colors[k]] = colorSets[j]['a:Value']['b:Color'][k]['b:value'];
                    }
                }

                return modules[i]["ColorStaticData"]["ModuleInstanceId"]['#text'];
            }
        }
    }


}

// Use map obtained from getModuleColorInstanceIdAndSingleColorMap and add all instances of color modules that
// mapped to RGBW and are single colors
function getColorModules(modulesDataJson, modulesArray, singleColorDict) {
    var colorModules = modulesDataJson["ModuleStore"]["ModuleData"][1]["Module"];

    for (let i = 0; i < colorModules.length; i++) {
        if (colorModules[i]["ColorData"]) {
            if (colorModules[i]["ColorData"]["ElementColorType"] == 'MultipleDiscreteColors') { 
                var colors = colorModules[i]["ColorData"]["ColorSetName"].split("").map(x => singleColorDict[x])
                var newColorModule = new Modules(colorModules[i]["@_moduleInstance"], colors )
                modulesArray.push(newColorModule);
            } else {
                var newColorModule = new Modules(colorModules[i]["@_moduleInstance"], [colorModules[i]["ColorData"]["SingleColor"]['a:value']] )
                modulesArray.push(newColorModule);
            }
        }
    }
}


// CSV Functions


function writeEventsToCSV(nodes, csvArray) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].channelId) {

            nodes[i].events.sort(function(a,b) {
                return a.attributes.intensity - b.attributes.intensity;
            })

            for (let j = 0; j < nodes[i].events.length; j++) {
                if (nodes[i].events[j].type == 'd2p1:SetLevelData') {
                    for (let k = nodes[i].events[j].startTime; k < nodes[i].events[j].endTime; k++) {
                        if (k < csvArray.length) { // why need?
                            csvArray[k][nodes[i].csv_row] = String(Math.floor(nodes[i].events[j].attributes.intensity * 255)).padStart(3, '0');
                        }                            
                    }
                }
            }
        }
    }
}

function saveCSV(filename, csvArray) {
    const csv = convertArrayToCSV(csvArray);
    fs.writeFile(filename, csv, function(err) {
    
        if(err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");
    }); 
}


// Make a csv array of length of song by 512 channels
function makeBlankCSVArray(sequenceDataJson, csvArray) {
    var songLength = sequenceDataJson["TimedSequenceData"]["Length"]["#text"];  //Way to parse song length of .tim file

    var songTimeArray = convertXMLTimeToTimeArray(songLength); // Rename variable
    var numberTimeFrames = convertTimeArrayToFrameStart(songTimeArray, timeInterval); // Rename variable

    for (let i = 0; i < numberTimeFrames; i++) { //time on x axis
        var channelArray = []
        for (let j = 0; j < 512; j++) { // channel on y axis   // HARDCODE
            channelArray.push("0".padStart(3, '0'))
        }
        csvArray.push(channelArray);
    }
}


// Events
function addEventsToChildren(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i].channelId) {
            for (var j = 0; j < nodes[i].children.length; j++ ){
                for (var k = 0; k < nodes[i].events.length; k++) {
                    if (nodes[i].children[j].channelId) {
                        if (nodes[i].events[k].attributes.color == nodes[i].children[j].color) {
                            nodes[i].children[j].events.splice(0, 0, nodes[i].events[k]);
                        }
                    } else {
                        nodes[i].children[j].events.splice(0, 0, nodes[i].events[k]);
                    }
                }
            }
        }
    }
}


function getEvents(sequenceDataJson, nodes) {
    var dataModels = sequenceDataJson["TimedSequenceData"]["_dataModels"]["d1p1:anyType"] //data models
    var nodeEvents = sequenceDataJson["TimedSequenceData"]["_effectNodeSurrogates"]['EffectNodeSurrogate']; //timing events

    for (let i = 0; i < nodeEvents.length; i++) {
        var currentNode = nodeEvents[i];
        var instanceId = currentNode["InstanceId"];

        var nodeId = currentNode["TargetNodes"]["ChannelNodeReferenceSurrogate"]["NodeId"]; //get Node Id

        var startTimeArray = convertXMLTimeToTimeArray(currentNode["StartTime"]); // Rename Variables
        var startTimeFrame = convertTimeArrayToFrameStart(startTimeArray, timeInterval);
        var endTimeArray = convertXMLTimeToTimeArray(currentNode["TimeSpan"])
        var endFrames = convertTimeArrayToFrameEnd(endTimeArray,startTimeArray, timeInterval);

        for (let j = 0; j < dataModels.length; j++) {
            if (dataModels[j]["ModuleInstanceId"] == instanceId) {
                var event;
                if (dataModels[j]['@_i:type'] === 'd2p1:SetLevelData') {
                    event = setLevel(nodeId, dataModels[j], startTimeFrame, endFrames, i)

                }

                for (var k = 0; k < nodes.length; k++) {
                    if (nodes[k].id == nodeId) {
                        if (nodes[k].channelId) {
                            if (event.attributes.color == nodes[k].color) {
                                nodes[k].events.push(event);
                            }
                        } else  {
                            nodes[k].events.splice(0, 0, event);
                        }
                    }
                }
            }
        }
    }
}

function setLevel(nodeId, dataModel, startTimeFrame, endFrame, eventNumber) {
    var hexValue = rgbHex(dataModel["d2p1:color"]["d3p1:_r"] * 255, dataModel["d2p1:color"]["d3p1:_g"] * 255 ,dataModel["d2p1:color"]["d3p1:_b"] * 255 );
    var decimalValue = parseInt("ff" + hexValue, 16);
    var attributes = {"intensity": dataModel['d2p1:level'], "color": decimalValue };
    return new Event(nodeId, startTimeFrame, endFrame, dataModel['@_i:type'], attributes, eventNumber);
    
}

// patch
function patchBullshit(configDataJson, nodes) {
    var outputs = configDataJson["SystemConfig"]["Controllers"]["Controller"]["Outputs"]["Output"]; // this will probably need to be changed for more than 512 channels... maybe
    var patches = configDataJson["SystemConfig"]["Patches"]["Patch"]; 

    for (var i = 0; i < outputs.length; i++) {
        var output_id = outputs[i]["@_id"];
        patchBullshitPart2ElectricAss(patches, output_id, nodes, i, 0);
    }
}


function patchBullshitPart2ElectricAss(patches, id, nodes, outputNumber, channel_output) {
    for (var i = 0; i < patches.length; i++) {
        if (patches[i]["@_componentId"] == id) {
            var foundCheck = false; //rename
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].channelId == patches[i]["@_sourceId"]) {
                    foundCheck = true;
                    var counter = 0; // rename
                    var notFound = true; // rename
                    while(notFound) {
                        if (nodes[j+ Number(channel_output)+ counter].channelId) {
                            nodes[j+ Number(channel_output) + counter ].csv_row = outputNumber;
                            notFound = false;
                        }
                        counter++;

                    }
                }
            }

            if (!foundCheck) {
                patchBullshitPart2ElectricAss(patches, patches[i]["@_sourceId"], nodes, outputNumber, patches[i]["@_output"]);
            }
        }
    }

}

// Nodes/channels
function getNodes(configDataJson, node_array, moduleArray, moduleColorInstanceId ) {
    var nodes = configDataJson["SystemConfig"]["Nodes"]; // rename

    for (let i = 0; i < nodes["Node"].length; i++) {
        var newNode = new Node(nodes["Node"][i]["@_name"], nodes["Node"][i]["@_id"]);
        node_array.push(newNode);
        addChildNodes(newNode, nodes["Node"][i]["Node"], node_array, moduleArray, moduleColorInstanceId);
    }
}


function addChildNodes(parent_node, childNodes, node_array, moduleArray, moduleColorInstanceId) {
    if (childNodes) {
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i]["Properties"]) {
                for (let j = 0; j < childNodes[i]["Properties"]["Property"].length; j++) {
                    if (childNodes[i]["Properties"]["Property"][j]["@_typeId"] == moduleColorInstanceId) {
                        for (var k = 0; k < moduleArray.length; k++) {
                            if (modulesArray[k].instanceId == childNodes[i]["Properties"]["Property"][j]["@_instanceId"]) {
                                for (var l = 0; l < modulesArray[k].colors.length; l++) {
                                    var child = new Node(childNodes[i]["@_name"], childNodes[i]["@_id"], modulesArray[k].colors[l]);
                                    child.channelId = childNodes[i]["@_channelId"];
                                    parent_node.children.push(child);
                                    node_array.push(child);
                                    addChildNodes(child, childNodes[i]["Node"], node_array, moduleArray, moduleColorInstanceId);

                                }
                            }
                        }
                    }
                }

            } else {
                var child = new Node(childNodes[i]["@_name"], childNodes[i]["@_id"]);
                parent_node.children.push(child);
                node_array.push(child);
                addChildNodes(child, childNodes[i]["Node"], node_array, moduleArray, moduleColorInstanceId);
            }
        }
    }
}



// Time functions
function convertXMLTimeToTimeArray(XMLTimeString) {
    if (XMLTimeString.includes('M')) {
        var songMinutes = XMLTimeString.split('PT')[1].split('M')[0];
        var songSeconds = XMLTimeString.split('PT')[1].split('M')[1].split('S')[0];
    }
    else {
        var songMinutes = 0;
        var songSeconds = XMLTimeString.split('PT')[1].split('S')[0];
    }
    return [songMinutes, songSeconds];
}

function convertTimeArrayToFrameEnd(endArray, startArray, interval) { // rename
    var frameLength = Number( 1000 / interval) ;

    var startMinutesToSeconds = (startArray[0] * 60);
    var startSeconds = (startArray[1]);

    var totalStartSeconds = Number(startMinutesToSeconds) + Number(startSeconds);

    var endMinutesToSeconds = (endArray[0] * 60);
    var endSeconds = (endArray[1]);

    var totalEndSeconds = Number(endMinutesToSeconds) + Number(endSeconds);

    var totalStartFrames = totalStartSeconds * frameLength;
    var totalEndFrames = totalEndSeconds * frameLength;
    var totalSeconds = ( totalStartFrames + totalEndFrames) ; // rename
    if (Number.isInteger(totalSeconds) || totalSeconds > Math.ceil(totalSeconds) - 0.0001) {
        return Math.ceil(totalSeconds) + 1;
    } else {
        return Math.ceil(totalSeconds);
    }
}

function convertTimeArrayToFrameStart(timeArray, interval) { // rename
    var minutesToSeconds = (timeArray[0] * 60);
    var frameLength = 1000 / interval ;

    var seconds = Number(timeArray[1]);

    var totalSeconds = Number(minutesToSeconds) +  seconds;

    return Math.ceil(totalSeconds * frameLength);
}







// function chase(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }

// function pulse(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }

// function twinkle(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }

// function candleFlicker(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }

// function alternating(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }

// function spin(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }

// function wipe(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

// }











