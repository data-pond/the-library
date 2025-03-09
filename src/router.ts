import { createMemoryHistory, createWebHashHistory, createRouter } from 'vue-router'

import Layout from './App.vue';
import {registerNewActivity} from "@//ts/activity.ts";
import {ActivityAction} from "@the_library/db";

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
import VoteBookPage from "@//pages/library/vote/VoteBookPage.vue";
import ChooseBestPage from "@//pages/library/vote/ChooseBestPage.vue";
import FavoritePages from "@//pages/library/vote/FavoritePages.vue";
import Connect from "@//pages/library/settings/Connect.vue";

import VoteIndex from "@//pages/library/vote/Index.vue";
import SelectFromFavoritePages from "@//pages/library/vote/SelectFromFavoritePages.vue";
import ConfirmSelectFromFavorite from "@//pages/library/vote/ConfirmSelectFromFavorite.vue";

import { PageViews, CustomEvent } from '@piwikpro/vue-piwik-pro'
import ConnectIndex from "./pages/library/connect/Index.vue"
import ReviewChanges from "@//pages/library/vote/ReviewChanges.vue";
import Tron from "@//pages/library/connect/Tron.vue";
import Core from "@//pages/library/connect/Core.vue";
import DownloadedBooks from "@//pages/library/account/DownloadedBooks.vue";
import FavoriteTopics from "@//pages/library/account/FavoriteTopics.vue";
import VisitedBooks from "@//pages/library/account/VisitedBooks.vue";
import InstallCoreStep1 from "@//pages/library/help/installCoreStep1.vue";
import Register from "@//pages/library/account/Register.vue";

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
                props: (route) => ({topicId: parseInt(route.params.id, 10)}),
                beforeEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitTopic, to.params.id)
                }
            },
            {
                path: 'bookList/:id',
                component: BookList,
                props: (route) => ({topTopicId: parseInt(route.params.id, 10)}),
                beforeEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitTopic, to.params.id)
                }
            },
            {
                path: 'read/:id',
                component: Read,
                props: (route) => ({bookId: parseInt(route.params.id, 10)}),
                beforeEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitBook, to.params.id)
                }
            },

            {
                path: 'account',
                children: [
                    {
                        path: '',
                        component: Account,
                        beforeEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitPage, 0)
                        }
                    },
                    {
                        path: 'downloadedBooks',
                        component: DownloadedBooks
                    },
                    {
                        path: 'favoriteTopics',
                        component: FavoriteTopics
                    },
                    {
                        path: 'visitedBooks',
                        component: VisitedBooks
                    }
                ],


            },
            {
                path: 'deal',
                component: Deal,
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 1)
                }
            },
            {
                path: 'help',
                component: Help,
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 2)
                }
            },
            {
                path: 'd-safe',
                component: DSafe,
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 3)
                }
            },
            {
                path: 'd-licence',
                component: TheD,
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 4)
                }
            },
            {
                path: 'admin-mode',
                component: ContributorMode,
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 5)
                }
            },{
                path: 'dev',
                component: Dev,
                name: 'dev',
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 6)
                }
            },
            {
                path: 'vision',
                component: Vision,
                name: 'vision',
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 7)
                }
            },
            {
                path: 'web3',
                component: Web3,
                name: 'web3',
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 8)
                }
            },
            {
                path: 'voteBookPage/:id',
                component: VoteBookPage,
                name: 'voteBookPage',
                props: (route) => ({bookId: parseInt(route.params.id, 10)}),
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 9)
                }
            },
            {
                path: 'chooseBestPage/:id',
                component: ChooseBestPage,
                name: 'chooseBestPage',
                props: (route) => ({bookId: parseInt(route.params.id, 10)}),
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 10)
                }

            },
            {
                path: 'previewBestPage/:bookId/:pageNumber',
                component: FavoritePages,
                name: 'previewBestPage',
                props: (route) => ({bookId: parseInt(route.params.bookId, 10), pageNumber: parseInt(route.params.pageNumber, 10)}),
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 11)
                }
            },
            {
              path: 'connection',
              component: ConnectIndex
            },
            {
                path: 'reviewChanges',
                component: ReviewChanges,
                afterEnter: (to, from) => {
                    registerNewActivity(ActivityAction.VisitPage, 12)
                }
            },
            {
              path: 'wallet',
              children:[
                  {
                      path: 'tron',
                      component: Tron
                  },
                  {
                      path: 'core',
                      component: Core
                  },
                  {
                      path: 'registerTCore',
                      component: Register
                  }
              ]


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
                      afterEnter: (to, from) => {
                          registerNewActivity(ActivityAction.VisitPage, 13)
                      }
                  },
                  {
                      path: 'selectFromFavorite/:slotId',
                      component: SelectFromFavoritePages,
                      name: 'selectFromFavorite',
                      props: (route) => ({slotId: route.params.slotId}),
                      afterEnter: (to, from) => {
                          registerNewActivity(ActivityAction.VisitPage, 14)
                      }
                  },
                  {
                      path: 'confirm/:voteId',
                      component: ConfirmSelectFromFavorite,
                      name: 'confirmSelectFromFavoriteVote',
                      props: (route) => ({voteId: route.params.voteId}),
                      afterEnter: (to, from) => {
                          registerNewActivity(ActivityAction.VisitPage, 15)
                      }
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
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitPage, 16)
                        }
                    }
                ]

            },
            {
              path: 'help',
                children: [
                    {
                        path: '',
                        component: HelpIndex,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitPage, 17)
                        }
                    },
                    {
                        path: 'voteBestCover',
                        component: VoteBestCover,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitPage, 18)
                        }
                    },
                    {
                        path: 'installCore_1',
                        component: InstallCoreStep1,
                        afterEnter: (to, from) => {
                            // registerNewActivity(ActivityAction.VisitPage, 18)
                        }
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
                        name: ActivityAction.adminTopicsIndex,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitPage, 19)
                        }
                    },
                    {
                        path: 'listTopics/:id',
                        component: Topics,
                        name: ActivityAction.ListTopics,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitTopic, to.params.id)
                        }
                    },
                    {
                        path: 'listBooks/:id',
                        component: Books,
                        name: ActivityAction.ListBooks,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitTopic, to.params.id)
                        }
                    },
                    {
                        path: 'bookCoversSync',
                        component: SyncBookCovers,
                    },
                    {
                        path: 'bookAdmin/:id',
                        component: ManageBook,
                        props: (route) => ({bookId: parseInt(route.params.id, 10)}),
                        name: ActivityAction.BookAdmin,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitBook, to.params.id)
                        }
                    },
                    {
                        path: 'tagAdmin/:id',
                        component: ManageTopic,
                        props: (route) => ({topicId: parseInt(route.params.id, 10)}),
                        name: ActivityAction.TopicAdmin,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitTopic, to.params.id)
                        }
                    },
                    {
                        path: 'catalogAdmin',
                        component: CatalogAdmin,
                        afterEnter: (to, from) => {
                            registerNewActivity(ActivityAction.VisitPage, 20)
                        }
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

export {router}