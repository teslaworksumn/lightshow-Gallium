const portAudio = parent.require('naudiodon');

const inputSelect = document.getElementById('audioInputDevice');

var promise = new Promise(((resolve, reject) => {
    resolve(portAudio.getDevices());
}));


promise.then((devicesList) => {
    console.log(devicesList.length)
    for (var i = 0; i < devicesList.length; i++) {
        var option = document.createElement('option');
        option.value = devicesList[i].id;
        option.text = devicesList[i].name;
        console.log(option);
        inputSelect.add(option);
    }
}).catch((err) => {
    console.log(err);
});

