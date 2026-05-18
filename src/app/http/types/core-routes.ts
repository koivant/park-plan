import type express from "express";
import type { AppDependencies } from "../../types/app.js";

export interface RegisterCoreRoutesOptions extends AppDependencies {
  app: express.Application;
}
