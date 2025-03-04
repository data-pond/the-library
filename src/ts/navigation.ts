import {DateUtils} from "@the_library/db";
import type {RouteLocation, Router} from "vue-router";
import {useRouter} from "vue-router";
import {getCurrentUrl, getPreviousUrl} from "@//router.ts";

const TopicNavigation = [];

export const addTopicNavigation = (topicFrom: number, topicTo: number) => {
    TopicNavigation.push({
        from: topicFrom,
        to: topicTo,
        ts: DateUtils.now()
    })
}

export const GetLastNavigationParentOf = (tagId: number) => {

    const data = [...TopicNavigation].filter(n => n.to === tagId).reverse()

    if (data.length === 0)
        return null;

    return data[0].from;
}


/**
 * Make sure the user visits both From And To before going to Final
 *
 *
 * When landing on FROM, CTAand Going To Final, make sure to visit To first
 * When Landing on To, if the navigation is coming from "FRom", then CTA goes to Final Else goes to "From"
 * When Landing on "FRom", And navigation comes from "To", CTA goes to Final ELSE CTA goes to "To"
 *
 * @param from
 * @param to
 * @param final
 */
export const getCTAVoteCover = (from: string, to: string, final: string): string => {
    const prevUrl = getPreviousUrl()
    const currentUrl = getCurrentUrl();
    if (currentUrl.fullPath === from) {
        if (prevUrl && prevUrl.fullPath === to) {
            return final;
        } else {
            return to
        }
    } else if (currentUrl.fullPath === to) {
        if (prevUrl && prevUrl.fullPath === from) {
            return final;
        } else {
            return from
        }
    }
}