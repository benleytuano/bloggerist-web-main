import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "@/services/auth.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("../layout/PublicLayout.vue"),
      children: [
        {
          path: "",
          name: "public-view",
          component: () => import("../views/HomeView.vue"),
        },
        {
          path: "/login",
          name: "login-page",
          component: () => import("../views/LoginView.vue"),
          meta: { requiresAuth: false },
        },
        {
          path: "/register",
          name: "register-page",
          component: () => import("../views/RegisterView.vue"),
          meta: { requiresAuth: false },
        },
      ],
    },
    {
      path: "/dashboard",
      name: "home",
      component: () => import("../layout/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "home-view",
          component: () => import("../views/HomeView.vue"),
        },
        {
          path: "/profile/:slug",
          name: "profile",
          component: () => import("../views/ProfileView.vue"),
        },
        {
          path: "/edit-profile",
          name: "edit-profile",
          component: () => import("../views/EditProfileView.vue"),
        },
        {
          path: "/create-article",
          name: "create-article",
          component: () => import("../views/CreateArticle.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/edit-article/:slug",
          name: "edit-article",
          component: () => import("../views/EditArticle.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/articles/:slug",
          name: "articles",
          component: () => import("../views/ArticlesView.vue"),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userIsAuthenticated = await isAuthenticated(); // Check if user is authenticated

  console.log(userIsAuthenticated);

  if (to.meta.requiresAuth && !userIsAuthenticated) {
    // Redirect to login if trying to access a protected route
    next("/login");
  } else if (
    !to.meta.requiresAuth &&
    userIsAuthenticated &&
    (to.path === "/login" || to.path === "/register" || to.path === "/")
  ) {
    // Redirect authenticated users away from login or signup
    next("/dashboard");
  } else {
    // Allow access
    next();
  }
});

export default router;
