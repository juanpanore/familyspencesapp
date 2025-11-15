import { Component, Input } from '@angular/core';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent {
  @Input() notifications: Notification[] = [];
}
