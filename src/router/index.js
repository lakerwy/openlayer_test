import Vue from "vue";
import VueRouter from "vue-router";
import testRoute from "../../map/test/route";
import testEarthRoute from '../../earth/test/route'

Vue.use(VueRouter);

let childRoutes = [];

console.log(process.env);

let env = process.env.NODE_ENV;
switch (env) {
  case "test":
    childRoutes = [...testRoute, ...testEarthRoute];
    break;

  default:
    childRoutes = [...testRoute, ...testEarthRoute];
    break;
}

const routes = [
  {
    path: "/",
    name: "home",
    redirect: { name: "test" }
  },
  ...childRoutes,
];

const router = new VueRouter({
  routes
});

export default router;
