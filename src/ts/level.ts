import {Activity, ActivityAction, getAllPatches} from "@the_library/db";
import {ref} from 'vue'
import {GetNbPatchesToSync, SyncProvider} from "@the_library/db";

const nbActionThreeshold = 5;

export const useLevel = () => {

    const levelUp = ref(false)
    const loading = ref(true)
    const level = ref(0)
    const progress = ref(0);


    getAllPatches().then(async (patchCollection) => {

        // const syncedData = await loadSyncedData();

        const nbActions = Object.keys(patchCollection).reduce((acc, objectType) => {
            switch(objectType) {
                case Activity.type:
                    return acc + Object.values(patchCollection[objectType]).filter((activity) => {
                        return activity.props.action != ActivityAction.VisitPage
                    }).length
                default:
                    return acc + Object.keys(patchCollection[objectType]).length
            }
        }, 0)

        const nbToSync = await GetNbPatchesToSync(SyncProvider.BTCore);

        levelUp.value = nbToSync>=nbActionThreeshold ;
        level.value = Math.floor(nbActions / nbActionThreeshold)+1;
        progress.value = (100 / nbActionThreeshold ) * ( nbActions % nbActionThreeshold )
        loading.value = false;
        console.log(`Level caLCULATIONl: nbActions ${nbActions} level: ${level.value}, levelUp: ${levelUp.value}, progress: ${progress.value}`)
    })

    return {
        levelUp,
        loading,
        progress,
        level
    }

}