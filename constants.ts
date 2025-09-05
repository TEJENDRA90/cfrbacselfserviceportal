
import type { Role, User, DefaultAssignmentRule, Attribute, UserRole, Application } from './types';

export const APP_LIST: string[] = [
    "VPP", "Crew Schedule", "Import Manager", "Work Order", 
    "Authority Report", "FR Authority Report", "License View", 
    "VPP Plan Download", "VPP Payroll Download", "Roster Create", 
    "Roster Assignment"
];

export const ATTRIBUTES: Attribute[] = ["Company", "Function", "Operation", "Ship", "Department", "Job Title"];

export const ATTRIBUTE_VALUES: Record<Attribute, string[]> = {
    Company: ["CH01", "CH02", "DE01", "FR01"],
    Function: ["Catering", "Nautical"],
    Operation: ["CHO", "FRR", "RHELMO"],
    Ship: ["ALR", "ATL", "BLD", "BEY"],
    Department: ["Front Office", "F&B", "Deck", "Engine"],
    "Job Title": ["Captain", "Supervisor", "Corporate Captain", "HR", "Hotel Manager", "Maitre D", "Nautic Scheduler"],
};

export const MOCK_ROLES: Role[] = [
    {
        id: "role-1",
        name: "Ship Captain",
        description: "Read/Write access to own ship's data only for NAU",
        permissions: [
            { attribute: "Company", values: ["All"] },
            { attribute: "Function", values: ["Nautical"] },
            { attribute: "Operation", values: ["All"] },
            { attribute: "Ship", values: ["Dynamic"] },
            { attribute: "Department", values: ["All"] },
            { attribute: "Job Title", values: ["All"] },
        ],
        writeRestrictionDays: 30,
        functionalityAccess: "Both",
        dayTypeAccess: ["All"],
        appAccess: [
            { appName: "VPP", actions: ["Read", "Write"] },
            { appName: "Crew Schedule", actions: ["Read", "Write"] },
            { appName: "License View", actions: ["Read", "Write"] },
        ]
    },
    {
        id: "role-2",
        name: "Ship Hotel Manager",
        description: "Full Read/Write for a specific Ship for Catering",
        permissions: [
            { attribute: "Company", values: ["All"] },
            { attribute: "Function", values: ["Catering"] },
            { attribute: "Operation", values: ["All"] },
            { attribute: "Ship", values: ["All"] },
            { attribute: "Department", values: ["Dynamic"] },
            { attribute: "Job Title", values: ["All"] },
        ],
        writeRestrictionDays: null, // No restriction
        functionalityAccess: "Planning View",
        dayTypeAccess: ["W", "W1", "V"],
        appAccess: [
            { appName: "VPP", actions: ["Read", "Write"] },
            { appName: "Work Order", actions: ["Read", "Write"] },
            { appName: "Roster Assignment", actions: ["Read", "Write"] },
        ]
    },
    {
        id: "role-3",
        name: "Corporate Captain",
        description: "Read-only access to specific operations",
        permissions: [
            { attribute: "Company", values: ["All"] },
            { attribute: "Function", values: ["Nautical"] },
            { attribute: "Operation", values: ["Dynamic"] },
            { attribute: "Ship", values: ["Dynamic"] },
            { attribute: "Department", values: ["All"] },
            { attribute: "Job Title", values: ["All"] },
        ],
        functionalityAccess: "Scheduling View",
        dayTypeAccess: ["All"],
        appAccess: [
            { appName: "Authority Report", actions: ["Read"] },
            { appName: "FR Authority Report", actions: ["Read"] },
            { appName: "License View", actions: ["Read"] },
        ]
    },
    {
        id: "role-4",
        name: "HR Admin",
        description: "Read/Write data across company",
        permissions: [
            { attribute: "Company", values: ["All"] },
            { attribute: "Function", values: ["Catering", "Nautical"] },
            { attribute: "Operation", values: ["All"] },
            { attribute: "Ship", values: ["All"] },
            { attribute: "Department", values: ["All"] },
            { attribute: "Job Title", values: ["All"] },
        ],
        writeRestrictionDays: 10,
        functionalityAccess: "Both",
        dayTypeAccess: ["All"],
        appAccess: [
            { appName: "Crew Schedule", actions: ["Read", "Write"] },
            { appName: "Import Manager", actions: ["Read", "Write"] },
            { appName: "VPP Payroll Download", actions: ["Read", "Write"] },
            { appName: "Roster Create", actions: ["Read", "Write"] },
        ]
    },
    {
        id: "role-5",
        name: "Super Admin",
        description: "Read/Write data across company",
        permissions: [
            { attribute: "Company", values: ["All"] },
            { attribute: "Function", values: ["All"] },
            { attribute: "Operation", values: ["All"] },
            { attribute: "Ship", values: ["All"] },
            { attribute: "Department", values: ["All"] },
            { attribute: "Job Title", values: ["All"] },
        ],
        writeRestrictionDays: null,
        functionalityAccess: "Both",
        dayTypeAccess: ["All"],
        appAccess: APP_LIST.map(app => ({ appName: app, actions: ["Read", "Write"] }))
    },
    {
        id: "role-6",
        name: "Exception Admin",
        description: "Specific exception role for a project.",
        permissions: [
            { attribute: "Company", values: ["FR01"] },
            { attribute: "Function", values: ["Catering"] },
            { attribute: "Operation", values: ["FR01"] },
            { attribute: "Ship", values: ["BLD"] },
            { attribute: "Department", values: ["All"] },
            { attribute: "Job Title", values: ["All"] },
        ],
        functionalityAccess: "Planning View",
        dayTypeAccess: ["T", "TH"],
        appAccess: [{ appName: "VPP Plan Download", actions: ["Read"] }]
    }
];

export const MOCK_USERS: User[] = [
    {
        id: "U001",
        name: "Captain Müller",
        jobTitle: "Captain",
        department: "Nautical",
        roles: [
            { roleId: "role-1", assignedOn: "2025-01-01", assignedBy: "Auto" }
        ]
    },
    {
        id: "U002",
        name: "Captain Dubois",
        jobTitle: "Captain",
        department: "Nautical",
        roles: [
            { roleId: "role-1", assignedOn: "2025-01-02", assignedBy: "Auto" }
        ]
    },
    {
        id: "U003",
        name: "Lisa Schmidt",
        jobTitle: "Hotel Manager",
        department: "F&B",
        roles: [
            { roleId: "role-2", assignedOn: "2025-03-01", assignedBy: "Auto" },
            { 
                roleId: "role-6",
                assignedOn: "2024-07-01",
                assignedBy: "Admin",
                reason: "Temporary project lead",
                startDate: "2024-07-01",
                endDate: "2024-12-31",
            },
            {
                roleId: "role-5",
                assignedOn: "2023-01-01",
                assignedBy: "Auto",
                removedOn: "2024-02-01"
            },
             { 
                roleId: "role-3", 
                assignedOn: "2024-01-01", 
                assignedBy: "Admin", 
                reason: "Past project", 
                startDate: "2024-01-15", 
                endDate: "2024-03-15"
            },
        ]
    },
    {
        id: "U004",
        name: "John Carter",
        jobTitle: "Corporate Captain",
        department: "Nautical",
        roles: [
            { roleId: "role-3", assignedOn: "2025-03-01", assignedBy: "Auto" }
        ]
    },
    {
        id: "U005",
        name: "Maria Rossi",
        jobTitle: "HR",
        department: "Corporate",
        roles: [
            { roleId: "role-4", assignedOn: "2025-04-01", assignedBy: "Auto" }
        ]
    }
];

export const MOCK_DEFAULT_ASSIGNMENTS: DefaultAssignmentRule[] = [
    { id: "rule-1", jobTitle: "Captain", roleIds: ["role-1"], ship: "ATL" },
    { id: "rule-2", jobTitle: "Master Captain", roleIds: ["role-1"] },
    { id: "rule-3", jobTitle: "Maitre D", roleIds: ["role-2"], function: "Catering" },
    { id: "rule-4", jobTitle: "Hotel Manager", roleIds: ["role-2", "role-6"] },
    { id: "rule-5", jobTitle: "Nautic Scheduler", roleIds: ["role-3"], company: "CH01", operation: "CHO" },
    { id: "rule-6", jobTitle: "HR", roleIds: ["role-4"] },
];

export const MOCK_APPLICATIONS: Application[] = [
    {
        id: "APP001",
        name: "VPP Portal",
        roleCollectionId: "RC001",
        createdBy: "Admin User",
        createdDate: "2024-01-15"
    },
    {
        id: "APP002", 
        name: "Crew Schedule Manager",
        roleCollectionId: "RC002",
        createdBy: "System Admin",
        createdDate: "2024-02-20"
    },
    {
        id: "APP003",
        name: "Work Order System",
        roleCollectionId: "RC003", 
        createdBy: "Admin User",
        createdDate: "2024-03-10"
    },
    {
        id: "APP004",
        name: "Authority Report Generator",
        roleCollectionId: "RC004",
        createdBy: "HR Admin",
        createdDate: "2024-04-05"
    },
    {
        id: "APP005",
        name: "License Management",
        roleCollectionId: "RC005",
        createdBy: "System Admin", 
        createdDate: "2024-05-12"
    }
];