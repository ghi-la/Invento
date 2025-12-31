import Login from "@/features/Account/Login";
import Register from "@/features/Account/Register";
import Dashboard from "@/features/Dashboard/Dashboard";
import { ComponentType } from "react";

type Path = {
    path: string;
    name: string;
    component: ComponentType<any>;
};

export const paths: Path[]= [
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
    }
    
];