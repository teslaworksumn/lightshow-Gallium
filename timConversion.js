
var fs = require('fs');
var xmlReader = require('xml2js');
const { convertArrayToCSV } = require('convert-array-to-csv');
const hexRgb = require('hex-rgb');
const rgbHex = require('rgb-hex');

// var timeInterval = 100; // HARDCODE 
var timeInterval = 25; // HARDCODE 

var arguments = process.argv.slice(2);
var timFile = arguments[0];
var configFile = arguments[1];
var modulesFile = arguments[2];

// Get data from timFile and system config file
var data = fs.readFileSync(timFile);
var sequenceData;
xmlReader.Parser().parseString(data, function (err, result) {
    sequenceData = JSON.stringify(result, null, 2);
});
var sequenceDataJson = JSON.parse(sequenceData);

var config = fs.readFileSync(configFile);
var configData;
xmlReader.Parser().parseString(config, function (err, result) {
    configData = JSON.stringify(result, null, 2);
});
var configDataJson = JSON.parse(configData);


var modules = fs.readFileSync(modulesFile);
var modulesData;
xmlReader.Parser().parseString(modules, function (err, result) {
    modulesData = JSON.stringify(result, null, 2);
});
var modulesDataJson = JSON.parse(modulesData);

//<Name>Rings</Name>
var modulesArray = [];
var singleColorDict = {};
var moduleColorInstanceId = getModuleColorInstanceIdAndSingleColorMap(modulesDataJson,singleColorDict)
// console.log(singleColorDict)
getColorModules(modulesDataJson, modulesArray, singleColorDict)

var nodes = [];
getNodes(configDataJson, nodes, modulesArray, moduleColorInstanceId);
patchBullshit(configDataJson, nodes);

// console.log(parentNodes);
// console.dir(nodes);

var events = [];
getEvents(sequenceDataJson, events, nodes);
addEventsToChildren(nodes);

// console.log(events);
// console.dir(events, {maxArrayLength: null});

// console.dir(nodes);

// console.dir(nodes, {maxArrayLength: null});

var csvArray = [];
makeBlankCSVArray(sequenceDataJson, nodes, csvArray);
writeEventsToCSV(events, nodes, csvArray)
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
function getModuleColorInstanceIdAndSingleColorMap(modulesDataJson, singleColorDict) { // rename
    var modules = modulesDataJson.ModuleStore.ModuleData[0].Module;
    for (let i = 0; i < modules.length; i++) {
        if (modules[i].$.dataModelType == "VixenModules.Property.Color.ColorStaticData, Color") {
            var colorSets = modules[i].ColorStaticData[0].ColorSets[0]['a:KeyValueOfstringArrayOfColor3odnvp_PE'];

            for (let j = 0; j < colorSets.length; j++) {
                var colors = colorSets[j]['a:Key'][0].split("");
                for (var k = 0; k < colors.length; k++ ) {
                    singleColorDict[colors[k]] = colorSets[j]['a:Value'][0]['b:Color'][k]['b:value'][0];
                }
            }

            return modules[i].$.moduleType;
        }
    }


}

function getColorModules(modulesDataJson, modulesArray, singleColorDict ) {
    var colorModules = modulesDataJson.ModuleStore.ModuleData[1].Module;

    for (let i = 0; i < colorModules.length; i++) {
        if (colorModules[i].$.dataModelType == "VixenModules.Property.Color.ColorData, Color") {
            if (colorModules[i].ColorData[0].ElementColorType[0] == 'MultipleDiscreteColors') { 
                var colors = colorModules[i].ColorData[0].ColorSetName[0].split("").map(x => singleColorDict[x])
                var newColorModule = new Modules(colorModules[i].$.moduleInstance, colors )
                modulesArray.push(newColorModule);
            } else {
                var newColorModule = new Modules(colorModules[i].$.moduleInstance, [colorModules[i].ColorData[0].SingleColor[0]['a:value'][0]] )
                modulesArray.push(newColorModule);
            }
        }
    }
}


// CSV Functions


function writeEventsToCSV(events, nodes, csvArray) {
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


function makeBlankCSVArray(sequenceDataJson, nodes, csvArray) {
    var songLength = sequenceDataJson.TimedSequenceData.Length[0]._;  //Way to parse song length of .tim file

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


function getEvents(sequenceDataJson, events, nodes) {
    var dataModels = sequenceDataJson.TimedSequenceData._dataModels[0]['d1p1:anyType'] //data models
    var nodeEvents = sequenceDataJson.TimedSequenceData._effectNodeSurrogates[0]['EffectNodeSurrogate']; //timing events

    for (let i = 0; i < nodeEvents.length; i++) {
        var currentNode = nodeEvents[i];
        var instanceId = currentNode.InstanceId[0];
        var nodeId = currentNode.TargetNodes[0].ChannelNodeReferenceSurrogate[0].NodeId[0]; //get Node Id

        var startTimeArray = convertXMLTimeToTimeArray(currentNode.StartTime[0]); // Rename Variables
        var startTimeFrame = convertTimeArrayToFrameStart(startTimeArray, timeInterval);
        var endTimeArray = convertXMLTimeToTimeArray(currentNode.TimeSpan[0])
        var endFrames = convertTimeArrayToFrameEnd(endTimeArray,startTimeArray, timeInterval);

        for (let j = 0; j < dataModels.length; j++) {
            if (dataModels[j].ModuleInstanceId == instanceId) {
                var event;
                if (dataModels[j].$['i:type'] === 'd2p1:SetLevelData') {
                    event = setLevel(nodeId, dataModels[j],startTimeFrame, endFrames, i)

                }

                for (var k = 0; k < nodes.length; k++) {
                    if (nodes[k].id == nodeId) {
                        if (nodes[k].channelId) {
                            if (event.attributes.color == nodes[k].color) {
                                nodes[k].events.push(event);
                            }
                        } else  {
                            nodes[k].events.splice(0, 0, event);
                        }s
                    }
                }
            }
        }
    }
}

function setLevel(nodeId, dataModel, startTimeFrame, endFrame, eventNumber) {

    var hexValue = rgbHex(dataModel["d2p1:color"][0]["d3p1:_r"][0] * 255, dataModel["d2p1:color"][0]["d3p1:_g"][0] * 255 ,dataModel["d2p1:color"][0]["d3p1:_b"][0] * 255 );
    var decimalValue = parseInt("ff" + hexValue, 16);
    var attributes = {"intensity": dataModel['d2p1:level'][0], "color": decimalValue };
    return new Event(nodeId, startTimeFrame, endFrame, dataModel.$['i:type'], attributes, eventNumber);
    
    

    
}

// patch
function patchBullshit(configDataJson, nodes) {
    var outputs = configDataJson.SystemConfig.Controllers[0].Controller[0].Outputs[0].Output; // this will probably need to be changed for more than 512 channels... maybe
    var patches = configDataJson.SystemConfig.Patches[0].Patch; 

    for (var i = 0; i < outputs.length; i++) {
        var output_id = outputs[i].$.id;
        patchBullshitPart2ElectricAss(patches, output_id, nodes, i, 0);
    }
}


function patchBullshitPart2ElectricAss(patches, id, nodes, outputNumber, channel_output) {
    for (var i = 0; i < patches.length; i++) {
        if (patches[i].$.componentId == id) {
            var foundCheck = false; //rename
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].channelId == patches[i].$.sourceId) {
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
                patchBullshitPart2ElectricAss(patches, patches[i].$.sourceId, nodes, outputNumber, patches[i].$.output);
            }
        }
    }

}

// Nodes/channels
function getNodes(configDataJson, node_array, moduleArray, moduleColorInstanceId ) {
    var nodes = configDataJson.SystemConfig.Nodes[0]; // rename

    for (let i = 0; i < nodes.Node.length; i++) {
        var newNode = new Node(nodes.Node[i].$.name, nodes.Node[i].$.id);
        var parentNodes = [];
        node_array.push(newNode);

        addChildNodes(newNode, nodes.Node[i].Node, node_array, parentNodes, moduleArray, moduleColorInstanceId);
    }
}


function addChildNodes(parent_node, childNodes, node_array, moduleArray, moduleColorInstanceId) {
    if (childNodes) {
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i].Properties) {
                for (let j = 0; j < childNodes[i].Properties[0].Property.length; j++) {
                    if (childNodes[i].Properties[0].Property[j].$.typeId == moduleColorInstanceId) {
                        for (var k = 0; k < moduleArray.length; k++) {
                            if (modulesArray[k].instanceId == childNodes[i].Properties[0].Property[j].$.instanceId) {
                                for (var l = 0; l < modulesArray[k].colors.length; l++) {
                                    var child = new Node(childNodes[i].$.name, childNodes[i].$.id, modulesArray[k].colors[l]);
                                    child.channelId = childNodes[i].$.channelId;
                                    parent_node.children.push(child);
                                    node_array.push(child);
                                    addChildNodes(child, childNodes[i].Node, node_array, moduleArray, moduleColorInstanceId);

                                }
                            }
                        }
                        
                    }
                }

            } else {
                var child = new Node(childNodes[i].$.name, childNodes[i].$.id);
                parent_node.children.push(child);
                node_array.push(child);
                addChildNodes(child, childNodes[i].Node, node_array, moduleArray, moduleColorInstanceId);


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
    var frameLength = 1000 / interval ;


    var startMinutesToSeconds = (startArray[0] * 60);
    var startSeconds = (startArray[1]);

    var totalStartSeconds = Number(startMinutesToSeconds) + Number(startSeconds);

    var endMinutesToSeconds = (endArray[0] * 60);
    var endSeconds = (endArray[1]);

    var totalEndSeconds = Number(endMinutesToSeconds) + Number(endSeconds);

    var totalSeconds = (totalStartSeconds + totalEndSeconds) * frameLength; // rename
    if (Number.isInteger(totalSeconds)) {
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











