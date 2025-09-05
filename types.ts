
export type Action = "Read" | "Write";

export type AppAccess = {
  appName: string;
  actions: Action[];
};

export type Attribute = "Company" | "Function" | "Operation" | "Ship" | "Department" | "Job Title";

export type PermissionValue = "All" | "Dynamic" | string;

export type RolePermission = {
  attribute: Attribute;
  values: PermissionValue[];
};

export type Role = {
  id: string;
  name:string;
  description: string;
  permissions: RolePermission[];
  writeRestrictionDays?: number | null; // null = No restriction
  functionalityAccess?: "Planning View" | "Scheduling View" | "Both";
  dayTypeAccess?: string[]; // "All" or a selection of specific day types
  appAccess?: AppAccess[];
};

export type UserRole = {
  roleId: string;
  assignedOn: string;
  assignedBy: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  removedOn?: string;
};

export type User = {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  roles: UserRole[];
};

export type DefaultAssignmentRule = {
    id: string;
    jobTitle: string;
    roleIds: string[];
    company?: string;
    function?: string;
    operation?: string;
    ship?: string;
    department?: string;
};

export type Application = {
  id: string;
  name: string;
  roleCollectionId: string;
  createdBy: string;
  createdDate: string;
};

export type Theme = 'light' | 'dark';
