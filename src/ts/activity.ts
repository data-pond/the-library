import {Activity, Book, DateUtils, NewActivity, SaveActivity, Tag} from "@the_library/db";

export enum ActivityAction {
    adminTopicsIndex= 'adminTopicsIndex',
    ListTopics = 'ListTopics',
    ListBooks = 'ListBooks',
    BookAdmin = 'BookAdmin',
    TopicAdmin = 'TopicAdmin',

    LibraryTopic = 'LibraryTopic',
    LibraryRead = 'LibraryRead',
    LibraryDownload = 'LibraryDownload',

}


export const registerActivityWithRoute = async (action: ActivityAction, route: any) => {
    const activity = NewActivity()
    activity.action = route.name
    activity.name = route.name
    activity.activityTs = Date.now()
    switch(action) {
        case ActivityAction.LibraryTopic:
            const topicId = route.params.id;
            activity.objectId = topicId;
            activity.objectType = Tag.type;
            break;
        case ActivityAction.LibraryRead:
        case ActivityAction.LibraryDownload:
            const bookId = route.params.id;
            activity.objectId = bookId;
            activity.objectType = Book.type;
            break;
        default:
            break;

    }

    await SaveActivity(activity.toJSON())
}
