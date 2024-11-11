import {Role} from "../config/roles.config";

export interface RoleResponse {
  code: number;
  role: Role;
  message?: string;
}
