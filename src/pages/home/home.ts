import { Component } from '@angular/core';
import {AlertController, LoadingController, NavController, ToastController} from 'ionic-angular';
import {GooglePlus} from "@ionic-native/google-plus";
import {MyService} from "../../services/auth";
import {MainPage} from "../main/main";
import 'rxjs';
import {PromptPage} from "../prompt/prompt";
import {PrivacyPage} from "../privacy/privacy";
import firebase from 'firebase';
import { Storage} from '@ionic/storage';
import {TermsPage} from "../terms/terms";
import {SplashScreen} from "@ionic-native/splash-screen";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  agree: boolean;
  constructor(
              private myService:MyService,
              private toastCtrl:ToastController,
              public googlePlus: GooglePlus,
              public navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private storage: Storage,
              public splashScreen: SplashScreen,
              private alertCtrl: AlertController) {




              // Or to get a key/value pair
              storage.get('json').then((val) => {
                if(val!=null){
                  this.myService.json = val;
                  this.tryRelogin();
                }else{
                  this.presentAlert();
                }
              }).catch( e => alert(e));



  }

  ionViewDidEnter(){
    this.splashScreen.hide();
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'WARNING !! <br>[BETA RELEASE]',
      subTitle: 'We don\'t need your account credentials.',
      message : `DudeLike will NEVER ask you for your username or password. We ONLY need a link to send your reward. <br><br> Keep in mind that we don\'t guarantee likes\' delivery.<br>PLEASE BE PATIENT.`,
      buttons: ['I understand.']
    });
    alert.present();
  }

  tryRelogin(){
    const loading = this.loadingCtrl.create({
      content: 'Signing you in...'
    });
    loading.present();

    firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(this.myService.json.idToken))
      .then(suc => {
        //console.log(res);
        this.myService.loggedIn=true;
        // set a key/value


        //alert(JSON.stringify(suc));
        loading.dismiss();
        this.navCtrl.setRoot(MainPage).catch((e) => {
          alert(e);
        });

      })
      .catch(err => {
        console.error(err);
        let toast = this.toastCtrl.create({
          message: err,
          duration: 3000,
          position: 'top'
        });
        toast.present();
        loading.dismiss();
      })
  }



  showGoogle(){
    if(!this.agree){
      let toast = this.toastCtrl.create({
        message: 'You should agree with Privacy Policy and Terms of use to continue.',
        duration: 5000,
        position: 'bottom'
      });
      toast.present();

    }else{
      const loading = this.loadingCtrl.create({
        content: 'Signing you in...'
      });
      loading.present();


      this.googlePlus.login({
        'scopes' : 'email',
        'webClientId': '384316743258-t99ksbndenf7m7h5j4pdjo4bn0r45vbh.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': false
      })
        .then(res => {
          var json = JSON.parse(JSON.stringify(res));

          firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(json.idToken))
            .then(suc => {
              //console.log(res);
              this.myService.json = json;
              this.myService.loggedIn=true;
              // set a key/value
              this.storage.set('json', this.myService.json).catch( e => alert(e));


              //alert(JSON.stringify(suc));
              loading.dismiss();
              this.navCtrl.setRoot(MainPage).catch((e) => {
                alert(e);
              });

            })
            .catch(err => {
              console.error(err);
              let toast = this.toastCtrl.create({
                message: err,
                duration: 3000,
                position: 'top'
              });
              toast.present();
              loading.dismiss();
            })
        })
        .catch(err => {
          console.error(err);
          let toast = this.toastCtrl.create({
            message: 'Error',
            duration: 3000,
            position: 'top'
          });
          toast.present();
          loading.dismiss();
        });
    }
  }

  showTerms() {
    this.navCtrl.push(TermsPage);
  }

  showPrivacy(){
    this.navCtrl.push(PrivacyPage);
  }


}
