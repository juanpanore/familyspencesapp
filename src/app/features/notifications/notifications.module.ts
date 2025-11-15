import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';

@NgModule({
  declarations: [
    NotificationBellComponent,
    NotificationListComponent,
    NotificationItemComponent,
    NotificationsPageComponent
  ],
  imports: [
    CommonModule,
    NotificationRoutingModule
  ],
  exports: [
    NotificationBellComponent
  ]
})
export class NotificationModule { }
