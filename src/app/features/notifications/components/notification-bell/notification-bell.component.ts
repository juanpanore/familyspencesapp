import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {

  unreadCount = 0;
  latest: Notification[] = [];
  userId = 'REEMPLAZAR_USER_ID';
  open = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.notificationService.getUnreadCount(this.userId)
      .subscribe(count => this.unreadCount = count);

    this.notificationService.getAllByUserId(this.userId)
      .subscribe(notifs => this.latest = notifs.slice(0, 5));
  }

  toggleDropdown(): void {
    this.open = !this.open;
  }
}
