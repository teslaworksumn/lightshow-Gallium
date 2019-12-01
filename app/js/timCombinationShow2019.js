const path = parent.require('path');
const timCombination = parent.require('./js/timCombination.js');

const feedback = document.getElementById('done');

async function combine(sequences) {
    const allSequences = sequences;
    const fullPathSequences = [];
    const fullDirectoryPath = document.getElementById('SelectedDirectory').innerHTML;
    const finalShowFolder = 'SHOW 2019 DO NOT EDIT';

    for (let i = 0; i < allSequences.length; i += 1) {
        allSequences[i][0] = path.join(finalShowFolder, allSequences[i][0]);

        // eslint-disable-next-line max-len
        fullPathSequences.push(allSequences[i].map(sequencePath => path.join(fullDirectoryPath, sequencePath)));
        timCombination.combineTimFiles(fullPathSequences[i]);
    }

    return [fullDirectoryPath, finalShowFolder];
}

async function combineTimFiles2019() {
    const martianOlympics = [
        '1_2084MartianOlympics.tim',
        '1_2084MartianOlympics_BrookeBear.tim',
        '1_2084MartianOlympics_DacTran.tim',
    ];
    const collide = [
        '2_Collide.tim',
        '2_Collide_HaleyCarrero.tim',
        '2_Collide_MitaliNaigaonkar.tim',
    ];
    const ursaMinor = [
        '3_UrsaMinor.tim',
        '3_UrsaMinor_ColleenJensen.tim',
        '3_UrsaMinor_AshmitaSarma.tim',
        '3_UrsaMinor_LeylaSoykan.tim',
        '3_UrsaMinor_BengtSymstad.tim',
    ];
    const jingleBreaks = [
        '4_JingleBreaks.tim',
        '4_JingleBreaks_JoshuaGuldberg.tim',
        '4_JingleBreaks_ByronAmbright.tim',
    ];
    const gloryToTheBells = [
        '5_GloryToTheBells.tim',
        '5_GloryToTheBells_BengtSymstad.tim',
        '5_GloryToTheBells_BrianaHerzog.tim',
    ];

    const sequences = [
        martianOlympics,
        collide,
        ursaMinor,
        jingleBreaks,
        gloryToTheBells,
    ];

    const paths = await combine(sequences);
    message = `Finished combining sequences.\nCombined sequences are located in '${paths[0]}/${paths[1]}'`;
    feedback.innerText = message;
}
