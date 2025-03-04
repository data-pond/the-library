import { createMemoryHistory, createWebHashHistory, createRouter } from 'vue-router'

import Layout from './App.vue';
import {ActivityAction, registerActivityWithRoute} from "@//ts/activity.ts";


import Topics from '@//pages/admin/Topics.vue';
import Books from '@//pages/admin/Books.vue';
import SyncBookCovers from "@//pages/admin/SyncBookCovers.vue";
import CatalogAdmin from "@//pages/admin/CatalogAdmin.vue";
import Fixes from "@//pages/admin/Fixes.vue";
import ManageTopic from "@//pages/admin/ManageTopic.vue";
import ManageBook from "@//pages/admin/ManageBook.vue";


import MainAlley from "@//pages/library/MainAlley.vue";
import Topic from "@//pages/library/Topic.vue";
import Account from "@//pages/library/Account.vue";
import Deal from "@//pages/library/static/Deal.vue";
import Help from "@//pages/library/Help.vue";
import Read from "@//pages/library/Read.vue";
import BookList from "@//pages/library/BookList.vue";
import DSafe from "@//pages/library/static/DSafe.vue";
import TheD from "@//pages/library/static/TheD.vue";
import ContributorMode from "@//pages/library/static/ContributorMode.vue";
import Vision from "@//pages/library/static/Vision.vue";
import Web3 from "@//pages/library/static/Web3.vue";
import Dev from "@//pages/library/Dev.vue";

import HelpLayout from "@//pages/library/help/Layout.vue"
import HelpIndex from "@//pages/library/help/Index.vue"
import VoteBestCover from "@//pages/library/help/voteBestCover.vue";
import VoteBookPage from "@//pages/library/VoteBookPage.vue";
import ChooseBestPage from "@//pages/library/vote/ChooseBestPage.vue";
import FavoritePages from "@//pages/library/vote/FavoritePages.vue";
import Connect from "@//pages/library/settings/Connect.vue";

import VoteIndex from "@//pages/library/vote/Index.vue";
import SelectFromFavoritePages from "@//pages/library/vote/SelectFromFavoritePages.vue";
import ConfirmSelectFromFavorite from "@//pages/library/vote/ConfirmSelectFromFavorite.vue";

import { PageViews, CustomEvent } from '@piwikpro/vue-piwik-pro'
import ConnectIndex from "./pages/library/connect/Index.vue"
import ReviewChanges from "@//pages/library/vote/ReviewChanges.vue";

const routes = [


    {
        path:"/",
        component: Layout,
        children: [
            {
                path: '',
                component: MainAlley,
            },
            {
                path: 'topic/:id',
                component: Topic,
                props: (route) => ({topicId: parseInt(route.params.id, 10)})
            },
            {
                path: 'bookList/:id',
                component: BookList,
                props: (route) => ({topTopicId: parseInt(route.params.id, 10)}),
                name: ActivityAction.LibraryTopic
            },
            {
                path: 'read/:id',
                component: Read,
                props: (route) => ({bookId: parseInt(route.params.id, 10)}),
                name: ActivityAction.LibraryRead
            },

            {
                path: 'account',
                component: Account,
                name: 'account'
            },
            {
                path: 'deal',
                component: Deal,
                name: 'deal'
            },
            {
                path: 'help',
                component: Help,
                name: 'help'
            },
            {
                path: 'd-safe',
                component: DSafe,
                name: 'd-safe'
            },
            {
                path: 'd-licence',
                component: TheD,
                name: 'theD'
            },
            {
                path: 'admin-mode',
                component: ContributorMode,
                name: 'contributor-mode'
            },{
                path: 'dev',
                component: Dev,
                name: 'dev'
            },
            {
                path: 'vision',
                component: Vision,
                name: 'vision'
            },
            {
                path: 'web3',
                component: Web3,
                name: 'web3'
            },
            {
                path: 'voteBookPage/:id',
                component: VoteBookPage,
                name: 'voteBookPage',
                props: (route) => ({bookId: parseInt(route.params.id, 10)}),
            },
            {
                path: 'chooseBestPage/:id',
                component: ChooseBestPage,
                name: 'chooseBestPage',
                props: (route) => ({bookId: parseInt(route.params.id, 10)}),
            },
            {
                path: 'previewBestPage/:bookId/:pageNumber',
                component: FavoritePages,
                name: 'previewBestPage',
                props: (route) => ({bookId: parseInt(route.params.bookId, 10), pageNumber: parseInt(route.params.pageNumber, 10)}),
            },
            {
              path: 'connection',
              component: ConnectIndex
            },
            {
                path: 'reviewChanges',
                component: ReviewChanges,
            },
            {
              path: 'vote',
              children: [
                  {
                      path: '',
                      component: VoteIndex,
                  },
                  {
                      path: 'bestCovers',
                      component: FavoritePages,
                      name: 'previewBestPage',
                  },
                  {
                      path: 'selectFromFavorite/:slotId',
                      component: SelectFromFavoritePages,
                      name: 'selectFromFavorite',
                      props: (route) => ({slotId: route.params.slotId}),
                  },
                  {
                      path: 'confirm/:voteId',
                      component: ConfirmSelectFromFavorite,
                      name: 'confirmSelectFromFavoriteVote',
                      props: (route) => ({voteId: route.params.voteId}),
                  }
              ]
            },
            {
                path: 'settings',
                children: [
                    {
                        path: '',
                        component: Connect,
                        name: "Sync Connect Settings",

                    }
                ]

            },
            {
              path: 'help',
                children: [
                    {
                        path: '',
                        component: HelpIndex,
                    },
                    {
                        path: 'voteBestCover',
                        component: VoteBestCover,
                    },
                ]
            },
            {
                path: "admin",
                component: Layout,
                children: [
                    {
                        path: '',
                        component: Topics,
                        name: ActivityAction.adminTopicsIndex
                    },
                    {
                        path: 'listTopics/:id',
                        component: Topics,
                        name: ActivityAction.ListTopics
                    },
                    {
                        path: 'listBooks/:id',
                        component: Books,
                        name: ActivityAction.ListBooks
                    },
                    {
                        path: 'bookCoversSync',
                        component: SyncBookCovers,
                    },
                    {
                        path: 'bookAdmin/:id',
                        component: ManageBook,
                        props: (route) => ({bookId: parseInt(route.params.id, 10)}),
                        name: ActivityAction.BookAdmin
                    },
                    {
                        path: 'tagAdmin/:id',
                        component: ManageTopic,
                        props: (route) => ({topicId: parseInt(route.params.id, 10)}),
                        name: ActivityAction.TopicAdmin
                    },
                    {
                        path: 'catalogAdmin',
                        component: CatalogAdmin,
                    },
                    {
                        path: 'fixes',
                        component: Fixes,
                    },

                ]
            },
        ]
    },

    {
        path: "/:catchAll(.*)*",
        component: () => import('./pages/404.vue'),
    }
]
 const router = createRouter({
    history: createWebHashHistory(),
    strict: true,
    routes

})
router.afterEach((to, from) => {
    PageViews.trackPageView(to.fullPath)
    CustomEvent.trackEvent('vue-router', 'afterEach', to.fullPath)
})

export const urlHistory = [];

export const getPreviousUrl = () => {
    if (urlHistory.length > 1) {
        return urlHistory[urlHistory.length - 2]
    }
    return null
}
export const getCurrentUrl = () => {
    if (urlHistory.length > 0) {
        return urlHistory[urlHistory.length - 1]
    }
    return null
}

router.beforeEach((to, from) => {
    urlHistory.push(to)
})

router.beforeEach((to, from) => {
    if (to.name) {
        registerActivityWithRoute(to.name, to)
    }
    // ...
    // explicitly return false to cancel the navigation
    return true
})

export {router}