
var fs = require('fs');
var xmlReader = require('xml2js');

const timeframe = 0.05;

var data = fs.readFileSync('./test/testfiles/test.tim'); // HARDCODE
var sequenceData;
xmlReader.Parser().parseString(data, function (err, result) {
    sequenceData = JSON.stringify(result, null, 2);
});


var config = fs.readFileSync('./test/testfiles/SystemConfig.xml'); //HARDCODE
var configData;
xmlReader.Parser().parseString(config, function (err, result) {
    configData = JSON.stringify(result, null, 2);
});

var sequenceDataJson = JSON.parse(sequenceData);
var configDataJson = JSON.parse(configData);
var sequenceDataArray = [];

var songLength = sequenceDataJson.TimedSequenceData.Length[0]._;  //Way to parse song length of .tim file
var songTimeArray = convertXMLTimeToTimeArray(songLength);
var numberTimeFrames = convertTimeArrayToFrame(songTimeArray)

var channels = configDataJson.SystemConfig.Channels[0].Channel
var channelLength = channels.length;

var dataModels = sequenceDataJson.TimedSequenceData._dataModels[0]['d1p1:anyType'] //data models
var nodeEvents = sequenceDataJson.TimedSequenceData._effectNodeSurrogates[0]['EffectNodeSurrogate'] //node events
var nodes = configDataJson.SystemConfig.Nodes[0];
var parentNodes = [];
var allChildNodes = [];
retrieveAllParentNodes(nodes,parentNodes);
retrieveChildNodes(nodes, allChildNodes);

for (let i = 0; i < numberTimeFrames; i++) { //time on x axis / sequenceDataArray[0]
    var channelArray = []
    for (let j = 0; j < channelLength; j++) { // channel on y axis / sequenceDataArray[0][0]
        channelArray.push(0)
    }
    sequenceDataArray.push(channelArray);
}

for (let i = 0; i < nodeEvents.length; i++) {
    var currentNode = nodeEvents[i];
    var instanceId = currentNode.InstanceId[0];
    var nodeId = currentNode.TargetNodes[0].ChannelNodeReferenceSurrogate[0].NodeId[0]; //get Node Id
    var startTimeArray = convertXMLTimeToTimeArray(currentNode.StartTime[0]);
    var startTimeFrame = convertTimeArrayToFrame(startTimeArray) + 1; // To adjust for DMX?
    var durationTimeArray = convertXMLTimeToTimeArray(currentNode.TimeSpan[0])
    var durationFrames = convertTimeArrayToFrame(durationTimeArray);
    var channelIdArray = [];
    var parentNodeCheck = false;
    for (let j = 0; j < dataModels.length; j++) {
        if (dataModels[j].ModuleInstanceId == instanceId) {
            for (let k = 0; k < parentNodes.length; k++) {
                if (parentNodes[k].$.id === nodeId) {
                    retrieveChildNodesID(parentNodes[k], channelIdArray);
                }
            }
            if (parentNodeCheck == false) {
                for (let k = 0; k<allChildNodes.length; k ++) {
                    if (allChildNodes[k].channelId == nodeId) {
                        channelIdArray[allChildNodes[k].id]
                    }
                }
            }

            if (dataModels[j].$['i:type'] === 'd2p1:SetLevelData') {
                var intensity = dataModels[j]['d2p1:level'];
                setLevel(sequenceDataArray, startTimeFrame, durationFrames, intensity, channelIdArray,channels);
            }
        }
    }
}
fs.writeFileSync('./test1.txt',JSON.stringify(sequenceDataArray))


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

function convertTimeArrayToFrame(timeArray) {
    return Math.ceil((timeArray[0] * 60) / timeframe + timeArray[1] / timeframe);
}

function retrieveChildNodes(parentNode, childNodes) {
    if (parentNode.Node) {
        for (let i = 0; i < parentNode.Node.length; i++) {
            if (parentNode.Node[i].$.channelId) {
                childNodes.push(parentNode.Node[i]);
            }
            retrieveChildNodes(parentNode.Node[i], childNodes);

        }
    }
}
function retrieveChildNodesID(parentNode, childNodeIds) {
    if (parentNode.Node) {
        for (let i = 0; i < parentNode.Node.length; i++) {
            if (parentNode.Node[i].$.channelId) {
                childNodeIds.push(parentNode.Node[i].$.channelId);
            }
            retrieveChildNodesID(parentNode.Node[i], childNodeIds);
        }
    }
}

function retrieveAllParentNodes(parentNode, childNodes) {
    if (parentNode.Node) {
        for (let i = 0; i < parentNode.Node.length; i++) {
            if (!parentNode.Node[i].$.channelId) {
                childNodes.push(parentNode.Node[i]);
            }
            retrieveAllParentNodes(parentNode.Node[i], childNodes);

        }
    }
}

function setLevel(sequenceArray, startTimeFrame, duration, intensity, channelIdArray, channelList) {
    for (let i = 0; i < channelIdArray.length; i++) {
        for(let j =0; j < channelList.length; j ++) { 
            if (channelList[j].$.id === channelIdArray[i]) {
                for (let m = 0; m < duration; m++) {
                    sequenceArray[startTimeFrame + m][j] = intensity * 255;
                }
            }
        }
    }
}

function chase(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}

function pulse(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}

function twinkle(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}

function candleFlicker(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}

function alternating(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}

function lipsync(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) { // are we going to support this.

}

function spin(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}

function wipe(sequenceArray, startTime, stopTime, startIntensity, stopIntensity) {

}











