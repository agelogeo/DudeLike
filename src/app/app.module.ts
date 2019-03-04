import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {GooglePlus} from "@ionic-native/google-plus";
import {MyService} from "../services/auth";
import {MainPage} from "../pages/main/main";
import {PromptPage} from "../pages/prompt/prompt";
import {PrivacyPage} from "../pages/privacy/privacy";
import {AdMobFree} from "@ionic-native/admob-free";
import {Clipboard} from "@ionic-native/clipboard";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import { AngularFireModule } from "angularfire2";
import firebase from 'firebase';
import {IonicStorageModule} from "@ionic/storage";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {TermsPage} from "../pages/terms/terms";
import {PopoverPage} from "../components/popover/popover";
import {AppRate} from "@ionic-native/app-rate";
import {SocialComponent} from "../components/social/social";
import {SocialSharing} from "@ionic-native/social-sharing";
import {AppVersion} from "@ionic-native/app-version";
import {VideoPage} from "../pages/video/video";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Push} from "@ionic-native/push";

export const firebaseConfig={
  apiKey: "AIzaSyBGGNERJEqSK6euKtE2tlqw7jP8DGRvc7M",
  authDomain: "dudelike-7d114.firebaseapp.com",
  databaseURL: "https://dudelike-7d114.firebaseio.com",
  projectId: "dudelike-7d114",
  storageBucket: "",
  messagingSenderId: "384316743258"
}
firebase.initializeApp(firebaseConfig);
firebase.database();
//firebase.messaging();


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    MainPage,
    PromptPage,
    PrivacyPage,
    TermsPage,
    PopoverPage,
    SocialComponent,
    VideoPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    MainPage,
    PromptPage,
    PrivacyPage,
    TermsPage,
    PopoverPage,
    SocialComponent,
    VideoPage
  ],
  providers: [
    StatusBar,
    AdMobFree,
    Clipboard,
    SplashScreen,
    HttpClient,
    GooglePlus,
    MyService,
    AndroidPermissions,
    Storage,
    AppRate,
    SocialSharing,
    AppVersion,
    Push,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
