import { Component, OnInit } from '@angular/core';
import { Notification } from '../../models/notification';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css']
})
export class NotificationsPageComponent implements OnInit {

  notifications: Notification[] = [];
  userId = 'REEMPLAZAR_USER_ID';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService
      .getAllByUserId(this.userId)
      .subscribe(res => this.notifications = res);
  }
}
