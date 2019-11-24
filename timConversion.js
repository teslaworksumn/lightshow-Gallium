
var fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');
// const rgbHex = require('rgb-hex');
var convert = require('color-convert');
var parser = require('fast-xml-parser');
var interpolateLineRange = require( 'line-interpolate-points' )
var arguments = process.argv.slice(2);
var timFile = arguments[0];
var configFile = arguments[1];
var modulesFile = arguments[2];
var timeInterval = arguments[3]

const Spline = require('cubic-spline');
 
// const xs = [0, 100];
// const ys = [0, 100];
 
// // new a Spline object
//  const spline = new Spline(xs, ys);

// get Y at arbitrary X
// for

// 100
// console.log(spline.at(8));


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
    this.colors;
}

function dataModel() {

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
        // only pay attention to that are not a parent
        if (nodes[i].channelId) {
            nodes[i].events.sort(function(a,b) {
                return a.attributes.intensity - b.attributes.intensity;
            })

            for (let j = 0; j < nodes[i].events.length; j++) {
                // if (nodes[i].events[j].type == 'd2p1:SetLevelData') { // maybe remove
                    for (let k = nodes[i].events[j].startTime; k < nodes[i].events[j].endTime; k++) {
                        if (k < csvArray.length) { // why need?
                            csvArray[k][nodes[i].csv_row] = String(Math.floor(nodes[i].events[j].attributes.intensity)).padStart(3, '0');
                        }                            
                    }
               // }
            }
        }
    }
}

function saveCSV(filename, csvArray) {
    fs.writeFileSync(filename, "");

    for (var i = 0; i < csvArray.length; i++) {
        var csvRow = csvArray[i].reduce(function (accumulator, currentValue) {
            return accumulator + "," + currentValue;
        }, "");
        
        csvRow += "\n";
        fs.writeFileSync(filename, csvRow.slice(1), {flag: 'a'});
    }
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
function addEventsToChildren(nodes) { //rename
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
    var events = [];

    var dataModelsDict = {};
    for (let j = 0; j < dataModels.length; j++) {
        dataModelsDict[dataModels[j]["ModuleInstanceId"]] = dataModels[j];
    }

    for (let i = 0; i < nodeEvents.length; i++) {
        var currentNode = nodeEvents[i];
        var instanceId = currentNode["InstanceId"];

        var nodeId = currentNode["TargetNodes"]["ChannelNodeReferenceSurrogate"]["NodeId"]; //get Node Id

        var startTimeArray = convertXMLTimeToTimeArray(currentNode["StartTime"]); // Rename Variables
        var startTimeFrame = convertTimeArrayToFrameStart(startTimeArray, timeInterval);
        var endTimeArray = convertXMLTimeToTimeArray(currentNode["TimeSpan"])
        var endFrames = convertTimeArrayToFrameEnd(endTimeArray,startTimeArray, timeInterval);
        if (dataModelsDict[instanceId]['@_i:type'] === 'd2p1:SetLevelData') {
            setLevel(nodeId, dataModelsDict[instanceId], startTimeFrame, endFrames, i, events);
        } else if (dataModelsDict[instanceId]['@_i:type'] === 'd2p1:PulseData') {
            // if (nodeId == "22dbb260-e7ea-49c7-b158-b60b4202fdf1") {8a9d52a4-229a-4134-a76e-90ef0d0fdfd1   19661895-c29c-446d-98b1-224bb343843c
            // if (nodeId == "22dbb260-e7ea-49c7-b158-b60b4202fdf1") {

                setPulse(nodeId, dataModelsDict[instanceId], startTimeFrame, endFrames, i, events, startTimeArray, endTimeArray);
            //}
        }

    }

    for (let i = 0; i < events.length; i++) {
        for (var k = 0; k < nodes.length; k++) {
            if (nodes[k].id == events[i].nodeId) {
                if (nodes[k].channelId) {
                    if (events[i].attributes.color == nodes[k].color) {
                        nodes[k].events.push(events[i]);
                    }
                } else  {
                    nodes[k].events.splice(0, 0, events[i]);
                }
            }
        }
    }
}

function setLevel(nodeId, dataModel, startTimeFrame, endFrame, eventNumber, events) {
    var hexValue = rgbHex(dataModel["d2p1:color"]["d3p1:_r"] * 255, dataModel["d2p1:color"]["d3p1:_g"] * 255 ,dataModel["d2p1:color"]["d3p1:_b"] * 255 );
    var decimalValue = parseInt("ff" + hexValue, 16);
    var attributes = {"intensity": dataModel['d2p1:level'], "color": decimalValue };
    events.push(new Event(nodeId, startTimeFrame, endFrame, dataModel['@_i:type'] * 255, attributes, eventNumber));
    
}

function setPulse(nodeId, dataModel, startTimeFrame, endFrame, eventNumber, events, startTimeArray, endTimeArray ) {

// console.log(interpolateLineRange( [[0,4.5477733554022608], [5.6309179920740853,4.5477733554022608], [11.050143192926628,40.344012320884417], [16.695168582452045,44.368441553690104], [21.888592733269064,44.792065683459128], [27.082016884086084,40.767636450653441], [32.501242084938625,31.024281465965984], [37.694666235755648,16.409248988934809], [42.888090386572664,11.113947366822066], [48.75891768749625,16.409248988934809]], 21)

    var colors = [];
    if (dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"].length > 0) {
        for (var i = 0; i < dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"].length; i++){
            var x = dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"][i]["d3p1:_color"]["d6p1:_x"];
            var y = dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"][i]["d3p1:_color"]["d6p1:_y"];
            var z = dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"][i]["d3p1:_color"]["d6p1:_z"];
            var rgb = convert.xyz.rgb(x,y,z);
            var hexValue = convert.rgb.hex(rgb[0], rgb[1], rgb[2])
            var decimalValue = parseInt("ff" + hexValue, 16);
            colors.push(decimalValue);
        }
    } else {
        var x = dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"]["d3p1:_color"]["d6p1:_x"]
        var y = dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"]["d3p1:_color"]["d6p1:_y"]
        var z = dataModel["d2p1:ColorGradient"]["d3p1:_colors"]["d3p1:ColorPoint"]["d3p1:_color"]["d6p1:_z"]
        var rgb = convert.xyz.rgb(x,y,z);
        var hexValue = convert.rgb.hex(rgb[0], rgb[1], rgb[2])
        var decimalValue = parseInt("ff" + hexValue, 16);
        colors.push(decimalValue);
    }

    var pointsX = [];
    var pointsY = [];
    // console.log(dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"])
    for (var i = 0; i < dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"].length; i++) {
        pointsX.push(dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"][i]["X"]["#text"]);
        pointsY.push(dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"][i]["Y"]["#text"]);
    }

    var startTime = convertTimeArrayToFrameStartNoCiel(startTimeArray, timeInterval);

    var duration = convertTimeArrayToFrameStartNoCiel(endTimeArray, timeInterval);
    // console.log("pointsX: ", pointsX);
    // console.log("pointsY: ", pointsY);


    // const spline = new Spline(pointsX, pointsY);
    // console.log("spline: ", spline);

    // var scale = 100 / ((endFrame - startTimeFrame));
    // var scale = 3.9;
    var scale = (100 / (duration));
    // var scale = (100 / 24.1);
                // var scale = (100 / 25);

    // var scale = 4;
    // console.log()

    console.log("scale: ", scale);
    console.log("duration: ", duration);

    // console.log(InterpolateX(24.8* scale, pointsX, pointsY))

    // var testpoints = [InterpolateX(.9* scale, pointsX, pointsY), InterpolateX(2* scale, pointsX, pointsY), InterpolateX(24.8* scale, pointsX, pointsY)]
    // var testpoints = [InterpolateX(.4* scale, pointsX, pointsY), InterpolateX(1.4* scale, pointsX, pointsY), InterpolateX(24.3* scale, pointsX, pointsY)]
    var testpoints = []

    var start =  1 - (startTime % 1);
    console.log("startTime: ", startTime)
    console.log("start: ", start)
    if (start == 1) {
        testpoints.push(InterpolateX(0, pointsX, pointsY))
        testpoints.push(InterpolateX(0, pointsX, pointsY))
    } else {
        testpoints.push(InterpolateX(0, pointsX, pointsY))
    }
    
    for (var i = 0; ((start + i) * scale) <= 100 ; i++) {
        // console.log("scale * i: ", scale * i);
        // console.log("spline.at(scale * i ): ",spline.at(scale * i));
        var x = (start + i) * scale;
        // console.log((start + i))
        // console.log(x)
        testpoints.push(InterpolateX(x, pointsX, pointsY))
    }

    // console.log("testpoints: ", testpoints);

    var interpolatedPointsMapped = testpoints.map(x => Number(x * 2.55) );
    // // var interpolatedPointsMapped1st = testpoints.map(x => x /100 );
    // // var interpolatedPointsMapped2nd = interpolatedPointsMapped1st.map(x => x * 255 );

    // // var interpolatedPointsMapped2 = interpolatedPointsMapped.map(x => Number(x) - 2 );
    // // var interpolatedPointsMappedCiel = interpolatedPointsMapped2.map(x => Math.ceil(x) );

    // var interpolatedPointsMappedCiel = interpolatedPointsMapped.map(x => Math.round(x) );
    var interpolatedPointsMappedCiel = interpolatedPointsMapped.map(function (x) {
        if (x > Math.ceil(x) - 0.0001) {
            return Math.ceil(x);
        } else {
            return Math.floor(x);
        }

    }  );


    // // var interpolatedPointsMapped2Test = interpolatedPointsMapped2nd.map(x => x - 2 );
    // // var interpolatedPointsMappedCielTest = interpolatedPointsMapped2Test.map(x => Math.ceil(x) );

    console.log("interpolatedPointsMapped: ", interpolatedPointsMapped)
    console.log("interpolatedPointsMappedCiel: ", interpolatedPointsMappedCiel)


    // console.log("interpolatedPointsMapped2Test: ", interpolatedPointsMapped2Test)
    // console.log("interpolatedPointsMappedCielTest: ", interpolatedPointsMappedCielTest)

// get Y at arbitrary X
// for

// 100
// console.log(spline.at(8));







    // var points = [];
    // // console.log(dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"])
    // for (var i = 0; i < dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"].length; i++) {
    //     points.push([dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"][i]["X"]["#text"], dataModel["d2p1:LevelCurve"]["d3p1:Points"]["d4p1:PointPair"][i]["Y"]["#text"]])
    // }
    // console.log("colors: ", colors);
    console.log("startTimeFrame: ", startTimeFrame)
    console.log("endFrame: ", endFrame)

    // var temp = convertTimeArrayToFrameStart(startTimeArray, timeInterval);
    // var temp1 = convertTimeArrayToFrameStart(endTimeArray, timeInterval);
    // console.log(temp1)
    // console.log((endFrame - startTimeFrame))


    // console.log("points: ", points);
    // var interpolatedPoints = interpolateLineRange(points, (endFrame - startTimeFrame)+1);
    // // var interpolatedPoints = interpolateLineRange(points, (endFrame - startTimeFrame) + 4);

    // // var interpolatedPoints = interpolateLineRange(points, (temp1 - temp)+6);

    // console.log("interpolatedPoints: ", interpolatedPoints);
    // var interpolatedPointsMapped = interpolatedPoints.map( subarray => subarray.map(x => x * 255/100 ));
    // console.log("interpolatedPointsMapped: ", interpolatedPointsMapped);
    // var interpolatedPointsMappedRounded = interpolatedPointsMapped.map( subarray => subarray.map( x => Math.round(x)));
    // console.log("interpolatedPointsMappedRounded: ", interpolatedPointsMappedRounded);

    // // console.log(interpolatedPointsMappedRounded.length)
    // // console.log(endFrame-startTimeFrame)
    // // console.log(interpolatedPointsMapped);
    for (var i = 0; i < colors.length; i++) {
            for ( var j = 0; j <= interpolatedPointsMappedCiel.length -1 ; j++) {
                // console.log(interpolatedPointsMappedRounded[j][0])
                // console.log(interpolatedPointsMappedCiel[j])
                var attributes = {"intensity": interpolatedPointsMappedCiel[j], "color": colors[i]};
                events.push(new Event(nodeId, startTimeFrame + j -1, startTimeFrame + j, dataModel['@_i:type'], attributes, eventNumber));

            }
    }
    // var attributes = {"intensity": dataModel['d2p1:level'], "color": decimalValue};
    // events.push(new Event(nodeId, startTimeFrame, endFrame, dataModel['@_i:type'], attributes, eventNumber));
    
}

function InterpolateX(x, pointsX, pointsY){
			var lo, mid, hi;

            // var lo = 0;
            // var hi = 1;
			// if (this.Count < 2)
			// 	throw new Exception("Error: Not enough points in curve to interpolate");

			// if (xTarget <= this[0].X) {
			// 	lo = 0;
			// 	hi = 1;
			// }
			// else if (xTarget >= this[this.Count - 1].X) {
			// 	lo = this.Count - 2;
			// 	hi = this.Count - 1;
			// }
			// else {
				// if x is within the bounds of the x table, then do a binary search
				// in the x table to find table entries that bound the x value
				lo = 0;
				hi = pointsX.length - 1;

				// limit to 1000 loops to avoid an infinite loop problem
				// int j;
				for (var j = 0; j < 1000 && hi > lo + 1; j++) {
					mid = (hi + lo)/2;
					if (x > pointsX[mid])
						lo = mid;
					else
						hi = mid;
				}

				// if (j >= 1000)
				// 	throw new Exception("Error: Infinite loop in interpolation");
			// }

			return (x - pointsX[lo])/(pointsX[hi] - pointsX[lo]) * (pointsY[hi] - pointsY[lo]) + pointsY[lo];
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
                    nodes[j+ Number(channel_output)].csv_row = outputNumber;
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

function convertTimeArrayToFrameStartNoCiel(timeArray, interval) { // rename
    var minutesToSeconds = (timeArray[0] * 60);
    var frameLength = 1000 / interval ;

    var seconds = Number(timeArray[1]);

    var totalSeconds = Number(minutesToSeconds) +  seconds;

    return totalSeconds * frameLength;
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











