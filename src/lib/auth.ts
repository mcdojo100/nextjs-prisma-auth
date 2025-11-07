// src/lib/auth.ts
import { getServerSession } from "next-auth";
export const getSession = () => getServerSession();
