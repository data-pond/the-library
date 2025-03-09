import {dump, Vote, VoteAction} from "@the_library/db";
export const loadFavoritePageVotes = () => {
    const db = dump()
    const hasVoteDb = db.has(Vote.type)
    return hasVoteDb ? Array.from(db.get(Vote.type).values()).filter(v => v.action === VoteAction.FavoritePages) : []
}
export const loadVotesForSlot = (slotId: number): Array<Vote> => {
    const db = dump()

    const hasVoteDb = db.has(Vote.type)
    const votes = hasVoteDb ? Array.from(db.get(Vote.type).values()) : []

    return votes.filter(v => v.action == VoteAction.FavoriteSlotId && parseInt(v.link3, 10) === slotId).sort((a,b) => b.ts - a.ts)
}

export const hasStartedBestBookCoverContest = () => {
    const db = dump()

    const hasVoteDb = db.has(Vote.type)
    const votes = hasVoteDb ? Array.from(db.get(Vote.type).values()) : []
    return  votes.filter(v => v.action === VoteAction.FavoritePages).length>0
}