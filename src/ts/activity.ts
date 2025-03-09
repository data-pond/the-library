import {NewActivity, SaveActivity, Tag, ActivityAction} from "@the_library/db";




export const registerNewActivity = async (action: ActivityAction, targetId: number) => {
    const activity = NewActivity()
    activity.action = action
    activity.activityTs = Date.now()
    activity.objectId = targetId;
    //
    //
    // await SaveActivity(activity.toJSON())
}
