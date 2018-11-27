var path = parent.require("path")
var timCombination = parent.require("./js/timCombination.js")


async function combineTimFiles2018() {
    var ClearSky = ["1_Clear_Sky.tim", "1_Clear_Sky_Bengt.tim", "1_Clear_Sky_Chris_Walaszek.tim", "1_Clear_Sky_Eileen_Campbell.tim"]
    var Unicorn = ["2_Unicorn_Adventure.tim", "2_Unicorn_Adventure_Kayla_Engelstad.tim","2_Unicorn_Adventure_Kailey_Pierce.tim"]
    var Dragons = ["3_Dragons_and_Dragons.tim", "3_Dragons_and_Dragons_Adam_Barsness.tim", "3_Dragons_and_Dragons_Leyla_Soykan.tim"]
    var Artic = ["4_Artic_Sunrise.tim", "4_Arctic_Sunrise_Jacob_Diethert.tim", "4_Arctic_Sunrise_Jacqueline_Sorenson.tim"]
    var Glory = ["5_Glory_to_the_Bells.tim", "5_Glory_to_the_Bells_Haley Carrero.tim", "5_Glory_to_the_Bells_Ian_Smith.tim"]


    var sequences = [ClearSky, Unicorn, Dragons, Artic, Glory]
    await combine(sequences);
    document.getElementById('done').innerText = "Done";

}

async function combine(sequences) {
    const fullDirectoryPath = document.getElementById('SelectedDirectory').innerHTML;
    var FinalShowFolder = "SHOW 2018 DO NOT EDIT"

    var fullPathSequences = [];
    for (var i = 0; i < sequences.length; i++) {
        sequences[i][0] = path.join(FinalShowFolder, sequences[i][0])
        fullPathSequences.push(sequences[i].map(sequencePath => {
            return path.join(fullDirectoryPath, sequencePath)
        }))
        timCombination.combineTimFiles(fullPathSequences[i])
    }
}