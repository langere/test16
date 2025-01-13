import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/LoginPage.vue';
import AdminPage from '@/components/admin/AdminPage.vue';
import DoctorPage from '@/components/doctor/DoctorPage.vue';
import PharmacyPage from '@/components/pharmacy/PharmacyPage.vue';
import RegistrarPage from '@/components/registrar/RegistrarPage.vue';
import CashierPage from '@/components/cashier/CashierPage.vue';
import RegisterPage from '@/components/register/RegisterPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/doctor',
    name: 'Doctor',
    component: DoctorPage,
    meta: { requiresAuth: true, role: 'doctor' }
  },
  {
    path: '/pharmacy',
    name: 'Pharmacy',
    component: PharmacyPage,
    meta: { requiresAuth: true, role: 'pharmacy' }
  },
  {
    path: '/registrar',
    name: 'Registrar',
    component: RegistrarPage,
    meta: { requiresAuth: true, role: 'registrar' }
  },
  {
    path: '/cashier',
    name: 'Cashier',
    component: CashierPage,
    meta: { requiresAuth: true, role: 'cashier' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 如果要访问登录页面
  if (to.path === '/login') {
    // 如果已经登录，重定向到对应的角色页面
    if (token && userRole) {
      const roleRoutes = {
        'admin': '/admin',
        'doctor': '/doctor',
        'registrar': '/registrar',
        'cashier': '/cashier',
        'pharmacy': '/pharmacy'
      };
      next(roleRoutes[userRole] || '/login');
    } else {
      next();
    }
    return;
  }

  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next('/login');
      return;
    }

    // 检查角色权限
    if (to.meta.role && to.meta.role !== userRole && userRole !== 'admin') {
      next('/login');
      return;
    }
  }

  next();
});

export default router;
