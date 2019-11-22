#!/bin/bash -eu

# node timConversion.js ../gallium-test-files/basicEffects/allon_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml
# diff ./test.csv ../gallium-test-files/basicEffects/allon_setLevel_100.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/allon_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml
# diff ./test.csv ../gallium-test-files/basicEffects/allon_setLevel_25.csv --strip-trailing-cr | wc -l

# node timConversion.js ../gallium-test-files/basicEffects/complicated_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml
# diff ./test.csv ../gallium-test-files/basicEffects/complicated_setLevel_100.csv --strip-trailing-cr | wc -l

node timConversion.js ../gallium-test-files/basicEffects/complicated_setLevel.tim ../gallium-test-files/basicEffects/SystemConfig.xml ../gallium-test-files/basicEffects/ModuleStore.xml
diff ./test.csv ../gallium-test-files/basicEffects/complicated_setLevel_25.csv --strip-trailing-cr | wc -l