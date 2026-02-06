import AboutUsView from '@/views/AboutUsView.vue'
import AdminView from '@/views/AdminView.vue'
import ArticleView from '@/views/ArticleView.vue'
import ContactRepairShopsView from '@/views/ContactRepairShopsView.vue'
import ContactView from '@/views/ContactView.vue'
import CreateJobView from '@/views/CreateJobView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import JobResponseView from '@/views/JobResponseView.vue'
import LandingView from '@/views/LandingView.vue'
import LayoutVue from '@/views/Layout.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import PricingPlansView from '@/views/PricingPlansView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import RegisterRepairShopView from '@/views/RegisterRepairShopView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RepairShopAgreementsView from '@/views/RepairShopAgreementsView.vue'
import RepairShopBookingView from '@/views/RepairShopBookingView.vue'
import RepairShopLandingPageView from '@/views/RepairShopLandingPageView.vue'
import RepairShopSettingsView from '@/views/RepairShopSettingsView.vue'
import SignedInRepairShopView from '@/views/SignedInRepairShopView.vue'
import SignedInUserView from '@/views/SignedInUserView.vue'
import SignInView from '@/views/SignInView.vue'
import TextEditorView from '@/views/TextEditorView.vue'
import UnsubscribeView from '@/views/UnsubscribeView.vue'
import UserAgreementsView from '@/views/UserAgreementsView.vue'
import UserBookingView from '@/views/UserBookingView.vue'
import UserLandingPageView from '@/views/UserLandingPageView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouterScrollBehavior
} from 'vue-router'

const scrollBehavior: RouterScrollBehavior = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  savedPosition: any
) => {
  return { top: 0, left: 0 }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: LayoutVue,
      children: [
        {
          path: '/',
          name: 'landing page',
          component: LandingView,
          meta: { index: true, prerender: true }
        },
        {
          path: '/vehicle-owner',
          name: 'User landing page',
          component: UserLandingPageView,
          meta: { index: true, prerender: true }
        },
        {
          path: '/repair-shop',
          name: 'Repair shop landing page',
          component: RepairShopLandingPageView,
          meta: { index: true, prerender: true }
        },
        {
          path: '/contact',
          name: 'contact',
          component: ContactView,
          meta: { index: true }
        },
        {
          path: '/about-us',
          name: 'about us',
          component: AboutUsView,
          meta: { index: true }
        },
        {
          path: '/user-agreements',
          name: 'userAgreement',
          component: UserAgreementsView,
          meta: { index: true }
        },
        {
          path: '/privacy-policy',
          name: 'privacyPolicy',
          component: PrivacyPolicyView,
          meta: { index: true }
        },
        {
          path: '/repair-shop-agreements',
          name: 'repairShopAgreement',
          component: RepairShopAgreementsView,
          meta: { index: true }
        },
        // {
        //   path: '/news',
        //   name: 'news',
        //   component: BlogLandingPageView,
        //   meta: { index: true, prerender: true }
        // },
        {
          path: '/news/:article',
          name: 'news article',
          component: ArticleView,
          meta: { index: true }
        },
        {
          path: '/register',
          name: 'register user',
          component: RegisterView,
          meta: { index: true }
        },
        {
          path: '/unsubscribe',
          name: 'unsubscribe repair shop',
          component: UnsubscribeView,
          meta: { index: true }
        },
        {
          path: '/register-repair-shop',
          name: 'register repair shop form',
          component: RegisterRepairShopView,
          meta: { index: true }
        },
        {
          path: '/price-plans',
          name: 'price plans',
          component: PricingPlansView,
          meta: { index: true }
        },
        {
          path: '/verify:id',
          name: 'verify user',
          component: VerifyEmailView,
          meta: { index: true }
        },
        {
          path: '/sign-in',
          name: 'sign in form',
          component: SignInView,
          meta: { index: true }
        },
        {
          path: '/forgot-password',
          name: 'forgot password view',
          component: ForgotPasswordView,
          meta: { index: true }
        },
        {
          path: '/get-offers',
          name: 'contact repair shop form',
          component: ContactRepairShopsView,
          meta: { index: true }
        },
        {
          path: '/my-jobs',
          name: 'user home',
          component: SignedInUserView,
          meta: { index: true, requiresAuth: true }
        },
        {
          path: '/job:id=:jobId',
          name: 'job response',
          component: JobResponseView,
          meta: { index: true, requiresAuth: true }
        },
        {
          path: '/user-garage-bookings',
          name: 'user bookings',
          component: UserBookingView,
          meta: { index: true, requiresAuth: true }
        },
        {
          path: '/repair-shop-garage-home',
          name: 'repair shop home',
          component: SignedInRepairShopView,
          meta: { index: true, requiresAuth: true, repairShopOnly: true }
        },
        {
          path: '/repair-shop-garage-onboarding',
          name: 'repair shop onboarding',
          component: OnboardingView,
          meta: { index: true, requiresAuth: true, repairShopOnly: true }
        },
        {
          path: '/repair-shop-settings',
          name: 'repair shop settings',
          component: RepairShopSettingsView,
          meta: { index: true, requiresAuth: true, repairShopOnly: true }
        },
        {
          path: '/repair-shop-garage-bookings',
          name: 'repair shop bookings',
          component: RepairShopBookingView,
          meta: { index: true, requiresAuth: true, repairShopOnly: true }
        },
        {
          path: '/user-garage-new',
          name: 'user create new job',
          component: CreateJobView,
          meta: { index: true, requiresAuth: true }
        },
        {
          path: '/admin',
          name: 'admin',
          component: AdminView,
          meta: { index: true, requiresAuth: true, adminOnly: true }
        },
        {
          path: '/text-editor',
          name: 'text editor',
          component: TextEditorView,
          meta: { index: true, requiresAuth: true, adminOnly: true }
        }
      ]
    }
  ],
  scrollBehavior
})

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next()
    } else {
      alert("You don't have access to this page!")
      next('/')
    }
  } else {
    next()
  }
})

export default router
