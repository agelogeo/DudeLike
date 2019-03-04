import {Component, ViewChild} from '@angular/core';
import {NavController, Platform, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import firebase from 'firebase';
import {MyService} from "../services/auth";
import {MainPage} from "../pages/main/main";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Push, PushObject, PushOptions} from "@ionic-native/push";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  mainPage:any = MainPage;
  @ViewChild('nav') nav: NavController;

  constructor(
              platform: Platform,
              statusBar: StatusBar,
              private push : Push,
              splashScreen : SplashScreen,private screenOrientation: ScreenOrientation,
              private androidPermissions: AndroidPermissions) {
                platform.ready().then(() => {
                  // set to landscape
                  this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

                  // Okay, so the platform is ready and our plugins are available.
                  // Here you can do any higher level native things you might need.
                  statusBar.styleDefault();


                  this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.GET_ACCOUNTS).then(
                    result => console.log('Has permission?',result.hasPermission),
                    err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.GET_ACCOUNTS)
                  );

                  this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.USE_CREDENTIALS).then(
                    result => console.log('Has permission?',result.hasPermission),
                    err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.USE_CREDENTIALS)
                  );

                  this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                    result => console.log('Has permission?',result.hasPermission),
                    err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
                  );
                  this.pushSetup();
                  //splashScreen.hide();
              });
  }

  pushSetup(){
    // to check if we have permission
    this.push.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
        } else {
          console.log('We do not have permission to send push notifications');
        }

      });

    this.push.createChannel({
      id: "dudelikechannel",
      description: "DudeLike Push Channel",
      // The importance property goes from 1 = Lowest, 2 = Low, 3 = Normal, 4 = High and 5 = Highest.
      importance: 3
    }).then(() => console.log('Channel created'));

    const options: PushOptions = {
      android: {
        senderID: '384316743258',
        forceShow : true,
        sound: true,
        vibrate: true
      },
      ios: {
        alert: true,
        badge: true,
        sound: true
      }
    };

    const pushObject: PushObject = this.push.init(options);


    pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

    pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }

}

