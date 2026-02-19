// Platform components
export { AsideNav } from './platform/admin/AsideNav';
export { SupportForm } from './platform/forms/Support';
export { NavBar } from './platform/navbar/NavBar';
export { UserChipMenu } from './platform/userchip/UserChipMenu';

// Platform admin components
export { default as EmailConfig } from './platform/admin/config/EmailConfig';
export { DashboardAdmin } from './platform/admin/dashboard/Dashboard';
export { RolesAdmin } from './platform/admin/rols/Rols';
export { StructureAdmin } from './platform/admin/structure/StructureAdmin';
export { UsersAdmin } from './platform/admin/users/UsersAdmin';

// Internal components  
export { default as AccommodationComponent } from './internal/AccommodationComponent';
export { default as FeedingComponent } from './internal/FeedingComponent';
export { default as MaintanceComponent } from './internal/MaintanceComponent';
export { default as MeterGroup } from './internal/MeterGroup';
export { default as StateBar } from './internal/StateBar';
export { default as StateChangeDialog } from './internal/StateChangeDialog';
export { default as TransportComponent } from './internal/TransportComponent';
export { default as UserSidebar } from './internal/UserSidebar';

// Teaching secretary components
export { PostInter } from './teaching_secretary/postgraduate/International';
export { PostNat } from './teaching_secretary/postgraduate/National';
export { TitleLegalization } from './teaching_secretary/TitleLegalization';
export { UnderInter } from './teaching_secretary/undergraduate/International';
export { UnderNat } from './teaching_secretary/undergraduate/National';

// Utility components
export * from './utils/styles';
